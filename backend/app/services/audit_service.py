"""
Service B — Product Audit
Reviews product from UX/product perspective using confirmed intent.
Only audits things visible from the sketch — no backend suggestions.
"""
from __future__ import annotations

import json
import re
from typing import Any

import requests
from app.core.config import settings

AUDIT_PROMPT = """You are a senior product manager reviewing a product sketch.

CONFIRMED INTENT:
{intent_json}

Perform a thorough product audit. Focus ONLY on what is visible in the sketch and intent.
DO NOT mention: backend APIs, databases, authentication middleware, server architecture, infrastructure.
ONLY suggest improvements that affect the product, UX, screens, flows, and frontend experience.

Return ONLY valid JSON with exactly this structure:
{{
  "missing_screens": [
    {{"name": "Screen name", "reason": "Why it's needed", "priority": "high|medium|low"}}
  ],
  "missing_user_flows": [
    {{"flow": "Flow name", "steps": ["step 1", "step 2"], "priority": "high|medium|low"}}
  ],
  "missing_ui_states": [
    {{"screen": "Screen name", "state": "loading|error|empty|success", "description": "What it should show"}}
  ],
  "industry_requirements": [
    {{"category": "Category", "requirement": "Specific requirement", "priority": "high|medium|low"}}
  ],
  "ux_recommendations": [
    {{"area": "Area", "issue": "Current issue", "recommendation": "Specific fix", "impact": "high|medium|low"}}
  ],
  "summary": "2-3 sentence executive summary of the product audit"
}}"""


def run_product_audit(intent: dict[str, Any]) -> dict[str, Any]:
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not set.")

    prompt = AUDIT_PROMPT.format(intent_json=json.dumps(intent, indent=2))

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": settings.CLAUDE_MODEL,
            "max_tokens": 3000,
            "system": (
                "You are a senior product manager. Review product specs and return structured JSON audits. "
                "Focus only on UX, screens, flows, and frontend experience. No backend suggestions."
            ),
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=90,
    )
    response.raise_for_status()
    text = response.json()["content"][0]["text"].strip()
    return _parse_json(text)


def _parse_json(text: str) -> dict[str, Any]:
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)
