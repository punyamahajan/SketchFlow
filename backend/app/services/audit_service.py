from __future__ import annotations

import json
import logging
import re
from typing import Any

import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

AUDIT_PROMPT_PREFIX = """You are a senior product manager and UX reviewer.

Analyze the product intent below and return ONLY valid JSON with exactly this structure (no other keys):

{
  "summary": "2-3 sentence executive summary of the product and its main gaps",
  "missing_screens": [
    {
      "name": "Screen name",
      "reason": "Why it is needed",
      "priority": "high|medium|low"
    }
  ],
  "missing_user_flows": [
    {
      "flow": "Flow name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "priority": "high|medium|low"
    }
  ],
  "missing_ui_states": [
    {
      "screen": "Screen name",
      "state": "loading|empty|error|success|disabled",
      "description": "What should happen in this state"
    }
  ],
  "industry_requirements": [
    {
      "category": "Legal|Security|Accessibility|Performance|SEO",
      "requirement": "Specific requirement description",
      "priority": "high|medium|low"
    }
  ],
  "ux_recommendations": [
    {
      "area": "Area of the UI",
      "issue": "What is wrong or missing",
      "recommendation": "Specific actionable fix",
      "impact": "high|medium|low"
    }
  ]
}

Product intent to review:

"""


def _build_prompt(intent: dict[str, Any]) -> str:
    return AUDIT_PROMPT_PREFIX + json.dumps(intent, ensure_ascii=False, indent=2)


def generate_audit(intent: dict[str, Any]) -> dict[str, Any]:
    prompt = _build_prompt(intent)

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": settings.CLAUDE_MODEL,
            "max_tokens": 8000,
            "system": (
                "You are a senior product manager. Review product intent and return structured JSON audits. "
                "Focus only on UX, screens, flows, and frontend experience. No backend suggestions. "
                "Return only the JSON object, no markdown, no explanation."
            ),
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )

    response.raise_for_status()
    payload = response.json()

    if payload.get("stop_reason") == "max_tokens":
        logger.warning(
            "Audit response hit max_tokens — JSON may be truncated. "
            "Consider raising max_tokens further if this persists."
        )

    text = payload["content"][0]["text"].strip()
    return _parse_json(text)


def run_product_audit(intent: dict[str, Any]) -> dict[str, Any]:
    """Entry point called from routes.py. Runs the full product audit pipeline."""
    return generate_audit(intent)


def _parse_json(text: str) -> dict[str, Any]:
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        recovered = _recover_truncated_json(text)
        if recovered is not None:
            logger.warning("Recovered truncated audit JSON — some fields may be missing.")
            return recovered
        raise


def _recover_truncated_json(text: str) -> dict[str, Any] | None:
    """
    Salvage a truncated JSON object by trimming back to the last
    successfully-closed brace/bracket at the top level.
    Returns a parsed dict on success, None if unrecoverable.
    """
    for end in range(len(text), 0, -1):
        if text[end - 1] not in ("}", "]"):
            continue
        try:
            return json.loads(text[:end])
        except json.JSONDecodeError:
            continue
    return None