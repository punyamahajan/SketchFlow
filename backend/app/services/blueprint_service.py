"""
Service C — Frontend Implementation Blueprint
Generates a comprehensive frontend blueprint document from intent + audit.
"""
from __future__ import annotations

import json
import re
from typing import Any

import requests
from app.core.config import settings

BLUEPRINT_PROMPT = """You are a senior frontend architect.

PRODUCT INTENT:
{intent_json}

PRODUCT AUDIT:
{audit_json}

Generate a comprehensive Frontend Implementation Blueprint.
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
    "mobile": ["requirement 1", "requirement 2"],
    "tablet": ["requirement 1", "requirement 2"],
    "desktop": ["requirement 1", "requirement 2"]
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
}}"""


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
            "max_tokens": 4000,
            "system": (
                "You are a senior frontend architect. Generate comprehensive frontend implementation blueprints. "
                "Return only valid JSON."
            ),
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=120,
    )
    response.raise_for_status()
    text = response.json()["content"][0]["text"].strip()
    return _parse_json(text)


def _parse_json(text: str) -> dict[str, Any]:
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)
