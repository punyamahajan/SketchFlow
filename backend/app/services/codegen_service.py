"""
Service D — React/Vite/TypeScript/TailwindCSS Frontend Generator
Two-pass generation: structure + key components first, then remaining files.
"""
from __future__ import annotations

import base64
import json
import re
from typing import Any

import requests
from app.core.config import settings

SYSTEM_PROMPT = (
    "You are an expert React/TypeScript/TailwindCSS developer. "
    "Generate production-quality, fully responsive React applications from UI sketches. "
    "Use TypeScript, Tailwind utility classes, proper component composition, and real content. "
    "Never use placeholder text. Output only what is explicitly requested — no markdown fences, no prose."
)


def _call_claude(messages: list[dict], max_tokens: int = 8000) -> str:
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": settings.CLAUDE_MODEL,
            "max_tokens": max_tokens,
            "system": SYSTEM_PROMPT,
            "messages": messages,
        },
        timeout=120,
    )
    response.raise_for_status()
    return "".join(b["text"] for b in response.json()["content"] if b.get("type") == "text")


def _extract_file(text: str, filename: str) -> str:
    """Pull content between ===filename=== and next === or EOF."""
    tag = f"==={filename}==="
    if tag not in text:
        return ""
    after = text.split(tag, 1)[1]
    # End at next ===...=== tag
    next_tag = re.search(r"===\S+===", after)
    if next_tag:
        after = after[:next_tag.start()]
    after = re.sub(r"^```[a-zA-Z]*\s*", "", after.strip())
    after = re.sub(r"\s*```\s*$", "", after.strip())
    return after.strip()


def generate_react_frontend(
    intent: dict[str, Any],
    audit: dict[str, Any],
    blueprint: dict[str, Any],
    file_bytes: bytes | None,
    filename: str | None,
) -> dict[str, str]:
    """
    Returns a dict of { filepath: file_content } for all generated files.
    Two passes:
      Pass 1 (image + all context) → App.tsx, types/index.ts, core layout components
      Pass 2 (pass 1 output + context) → page components, hooks, config files
    """
    context = _build_context(intent, audit, blueprint)

    # Pass 1 — core structure
    print("[SketchFlow] React gen pass 1/2 — core structure")
    p1_messages = _build_pass1_messages(context, file_bytes, filename)
    p1_raw = _call_claude(p1_messages, max_tokens=8000)
    p1_files = _parse_tagged_files(p1_raw)

    # Pass 2 — pages + config
    print("[SketchFlow] React gen pass 2/2 — pages + config")
    p2_raw = _call_claude(
        _build_pass2_messages(context, p1_raw),
        max_tokens=8000,
    )
    p2_files = _parse_tagged_files(p2_raw)

    return {**p1_files, **p2_files}


def _build_context(intent: dict, audit: dict, blueprint: dict) -> str:
    return f"""PRODUCT: {intent.get("product_name")} ({intent.get("product_type")})
GOAL: {intent.get("user_goal")}
SCREENS: {", ".join(intent.get("screens", [])[:10])}
FEATURES: {", ".join(intent.get("features", [])[:10])}
DETECTED UI: {", ".join(intent.get("detected_ui", [])[:12])}
LAYOUT: {intent.get("layout_notes", "")}
USER ROLES: {", ".join(intent.get("user_roles", []))}
USER FLOWS: {", ".join(intent.get("user_flows", []))}

DESIGN SYSTEM:
{json.dumps(blueprint.get("design_system", {}), indent=2)}

SCREEN INVENTORY:
{json.dumps(blueprint.get("screen_inventory", []), indent=2)}

COMPONENT INVENTORY:
{json.dumps(blueprint.get("component_inventory", []), indent=2)}

AUDIT RECOMMENDATIONS:
{json.dumps(audit.get("ux_recommendations", []), indent=2)}"""


def _build_pass1_messages(context: str, file_bytes: bytes | None, filename: str | None) -> list[dict]:
    image_instruction = (
        "The sketch image is attached. Replicate its layout, sections, and visual hierarchy faithfully."
        if file_bytes else
        "No image. Infer the best layout from the product context and blueprint."
    )

    prompt = f"""{image_instruction}

{context}

━━━ PASS 1: Generate these files ━━━
Use Tailwind utility classes for ALL styling — no inline styles, no CSS files.
Use TypeScript throughout. Use real data matching the sketch.
Make it fully responsive: mobile-first with sm:, md:, lg: breakpoints.

Generate each file between its === tags:

===src/types/index.ts===
// All TypeScript interfaces and types

===src/components/layout/Sidebar.tsx===
// Fixed sidebar with nav links, logo, active states, mobile collapse

===src/components/layout/Navbar.tsx===
// Top navbar with search, notifications, user menu, hamburger

===src/components/layout/Layout.tsx===
// Shell wrapping Sidebar + Navbar + children, handles mobile sidebar toggle

===src/App.tsx===
// Main app with React Router routes for all screens

===src/pages/Dashboard.tsx===
// Full dashboard page with all sections visible in the sketch — real data, charts with recharts
"""

    content: list[dict] = []
    if file_bytes:
        mime = _guess_mime(filename)
        b64 = base64.standard_b64encode(file_bytes).decode()
        content.append({"type": "image", "source": {"type": "base64", "media_type": mime, "data": b64}})
    content.append({"type": "text", "text": prompt})

    return [{"role": "user", "content": content}]


def _build_pass2_messages(context: str, pass1_output: str) -> list[dict]:
    prompt = f"""You already generated the core structure. Here is what was generated:

{pass1_output[:3000]}

{context}

━━━ PASS 2: Generate remaining files ━━━

===src/pages/Orders.tsx===
// Orders page with table, filters, status badges

===src/pages/Products.tsx===
// Products page with grid/list view, search, filters

===src/pages/Customers.tsx===
// Customers page with table

===src/components/ui/StatCard.tsx===
// Reusable KPI stat card with icon, value, label, change percentage

===src/components/ui/DataTable.tsx===
// Reusable typed table component

===src/components/ui/Badge.tsx===
// Status badge with variants: completed, processing, shipped, cancelled

===src/hooks/useSidebar.ts===
// Sidebar open/close state hook

===package.json===
{{
  "name": "sketchflow-app",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {{"dev": "vite", "build": "vite build", "preview": "vite preview"}},
  "dependencies": {{"react": "^18.3.0", "react-dom": "^18.3.0", "react-router-dom": "^6.26.0", "recharts": "^2.12.0", "lucide-react": "^0.446.0"}},
  "devDependencies": {{"@types/react": "^18.3.0", "@types/react-dom": "^18.3.0", "@vitejs/plugin-react": "^4.3.0", "autoprefixer": "^10.4.20", "postcss": "^8.4.45", "tailwindcss": "^3.4.12", "typescript": "^5.5.0", "vite": "^5.4.0"}}
}}

===vite.config.ts===
import {{ defineConfig }} from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({{ plugins: [react()] }})

===tailwind.config.js===
/** @type {{import('tailwindcss').Config}} */
export default {{
  content: ['./index.html', './src/**/*.{{ts,tsx}}'],
  theme: {{ extend: {{}} }},
  plugins: [],
}}

===tsconfig.json===
{{"compilerOptions": {{"target": "ES2020","useDefineForClassFields": true,"lib": ["ES2020","DOM","DOM.Iterable"],"module": "ESNext","skipLibCheck": true,"moduleResolution": "bundler","allowImportingTsExtensions": true,"isolatedModules": true,"moduleDetection": "force","noEmit": true,"jsx": "react-jsx","strict": true}}, "include": ["src"]}}

===index.html===
<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>{context.split("PRODUCT:")[1].split("(")[0].strip()}</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>

===src/main.tsx===
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)

===src/index.css===
@tailwind base;
@tailwind components;
@tailwind utilities;
"""
    return [{"role": "user", "content": prompt}]


def _parse_tagged_files(raw: str) -> dict[str, str]:
    """Extract all ===filepath=== blocks from the raw output."""
    files: dict[str, str] = {}
    # Find all === tags
    parts = re.split(r"(===[^=\n]+===)", raw)
    current_key: str | None = None
    for part in parts:
        if re.match(r"^===[^=\n]+===$", part.strip()):
            current_key = part.strip()[3:-3]  # strip ===
        elif current_key:
            content = re.sub(r"^```[a-zA-Z]*\s*", "", part.strip())
            content = re.sub(r"\s*```\s*$", "", content.strip()).strip()
            if content:
                files[current_key] = content
            current_key = None
    return files


def _guess_mime(filename: str | None) -> str:
    if not filename:
        return "image/png"
    lower = filename.lower()
    if lower.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if lower.endswith(".webp"):
        return "image/webp"
    return "image/png"
