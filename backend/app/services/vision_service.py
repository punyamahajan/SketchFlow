"""
Service A — Vision + Intent Extraction
Sends sketch image to Claude Vision, returns structured intent JSON.
"""
from __future__ import annotations

import base64
import json
import re
from typing import Any

import requests
from app.core.config import settings

EXTRACT_PROMPT = """Analyze this product sketch or wireframe image carefully.

Return ONLY valid JSON (no markdown, no explanation) with exactly these keys:
{
  "product_name": "specific product name visible or inferred",
  "product_type": "precise type (e.g. 'e-commerce sunglasses store', 'B2B SaaS analytics dashboard')",
  "user_goal": "one specific sentence describing what the user accomplishes",
  "screens": ["exact section/screen names visible in the sketch, max 10"],
  "features": ["specific UI features visible, max 10"],
  "user_roles": ["user types e.g. Admin, Customer, Guest"],
  "user_flows": ["primary flows e.g. Browse → Cart → Checkout"],
  "detected_ui": ["specific UI components drawn, max 12"],
  "layout_notes": "brief description of layout, section order, column structure",
  "assumptions": ["specific inferred assumptions, max 6"],
  "open_questions": ["specific unresolved design questions, max 6"]
}
Be very specific. Use the actual text labels visible in the sketch."""


def extract_intent(
    file_bytes: bytes,
    filename: str | None,
    project_name: str | None = None,
) -> dict[str, Any]:
    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not set.")

    mime = _guess_mime(filename)
    b64 = base64.standard_b64encode(file_bytes).decode()

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": settings.CLAUDE_MODEL,
            "max_tokens": 1500,
            "system": (
                "You are a product analyst. Analyze UI sketches and return structured JSON only. "
                "No markdown, no explanation, only the JSON object."
            ),
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": mime, "data": b64}},
                    {"type": "text", "text": EXTRACT_PROMPT},
                ],
            }],
        },
        timeout=60,
    )
    response.raise_for_status()
    text = response.json()["content"][0]["text"].strip()
    intent = _parse_and_normalize(text)
    if project_name:
        intent["product_name"] = project_name.strip()
    return intent


def _parse_and_normalize(text: str) -> dict[str, Any]:
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    raw = json.loads(text)

    list_keys = ("screens", "features", "user_roles", "user_flows",
                 "detected_ui", "assumptions", "open_questions")
    intent: dict[str, Any] = {}
    for key in ("product_name", "product_type", "user_goal", "layout_notes"):
        intent[key] = str(raw.get(key, "")).strip()
    for key in list_keys:
        val = raw.get(key, [])
        intent[key] = [str(x).strip() for x in val if str(x).strip()] if isinstance(val, list) else []
    if not intent["product_name"]:
        intent["product_name"] = "Untitled Product"
    if not intent["screens"]:
        intent["screens"] = ["Main view"]
    return intent


def _guess_mime(filename: str | None) -> str:
    if not filename:
        return "image/png"
    lower = filename.lower()
    if lower.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if lower.endswith(".webp"):
        return "image/webp"
    return "image/png"
