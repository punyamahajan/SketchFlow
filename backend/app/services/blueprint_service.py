"""
Service C — Frontend Implementation Blueprint
Generates a comprehensive frontend blueprint document from intent + audit.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any

import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

BLUEPRINT_PROMPT = """You are a senior frontend architect.

PRODUCT INTENT:
{intent_json}

PRODUCT AUDIT:
{audit_json}

Generate a concise Frontend Implementation Blueprint.
Return ONLY valid JSON with exactly this structure:

{{
  "product_overview": {{
    "name": "Product name",
    "type": "Product type",
    "goal": "User goal",
    "tech_stack": ["React", "Vite", "TypeScript", "TailwindCSS"]
  }},
  "screen_inventory": [
    {{
      "name": "Screen name",
      "route": "/route",
      "description": "What this screen does",
      "components": ["Component 1", "Component 2"],
      "priority": "core|secondary|nice-to-have"
    }}
  ],
  "component_inventory": [
    {{
      "name": "ComponentName",
      "type": "page|layout|ui|form|chart",
      "props": ["prop1: type", "prop2: type"],
      "description": "What it does"
    }}
  ],
  "user_flows": [
    {{
      "name": "Flow name",
      "steps": ["Step 1", "Step 2"],
      "screens_involved": ["Screen A", "Screen B"]
    }}
  ],
  "responsive_requirements": {{
    "mobile": ["requirement 1"],
    "tablet": ["requirement 1"],
    "desktop": ["requirement 1"]
  }},
  "accessibility_requirements": ["requirement 1", "requirement 2"],
  "ui_states": [
    {{"component": "ComponentName", "states": ["loading", "error", "empty", "success"]}}
  ],
  "design_system": {{
    "colors": {{"primary": "#hex", "secondary": "#hex", "background": "#hex", "text": "#hex", "accent": "#hex"}},
    "typography": {{"headingFont": "font name", "bodyFont": "font name"}},
    "spacing": "Tailwind default spacing scale",
    "borderRadius": "rounded-xl for cards, rounded-full for pills"
  }},
  "recommended_libraries": [
    {{"name": "library", "purpose": "what it's for", "install": "npm install command"}}
  ]
}}

Important: Be concise. Limit screen_inventory to the most important screens, component_inventory to key components only. The response must be complete valid JSON."""


def generate_blueprint(intent: dict[str, Any], audit: dict[str, Any]) -> dict[str, Any]:
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not set.")

    prompt = BLUEPRINT_PROMPT.format(
        intent_json=json.dumps(intent, indent=2),
        audit_json=json.dumps(audit, indent=2),
    )

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": settings.CLAUDE_MODEL,
            "max_tokens": 8000,  # raised from 4000 — blueprint was being truncated
            "system": (
                "You are a senior frontend architect. Generate concise frontend implementation blueprints. "
                "Return only valid JSON. Be brief — quality over quantity."
            ),
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    response.raise_for_status()

    payload = response.json()
    if payload.get("stop_reason") == "max_tokens":
        logger.warning(
            "Blueprint response hit max_tokens — JSON may be truncated. "
            "Attempting recovery."
        )

    text = payload["content"][0]["text"].strip()
    return _parse_json(text)


def _parse_json(text: str) -> dict[str, Any]:
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        recovered = _recover_truncated_json(text)
        if recovered is not None:
            logger.warning("Recovered truncated blueprint JSON — some fields may be missing.")
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