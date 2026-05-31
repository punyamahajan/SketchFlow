<div align="center">

# SketchFlow AI

**Sketch → Intent → Audit → Blueprint → Production React Code**

*Upload a wireframe. Get a full frontend. In minutes.*

[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Claude](https://img.shields.io/badge/Powered%20by-Claude%20AI-d97706?style=flat-square)](https://anthropic.com)

</div>

---

## What is SketchFlow?

SketchFlow AI transforms a hand-drawn wireframe or whiteboard photo into a fully structured, production-ready React application — using Claude's vision and reasoning capabilities across a five-stage pipeline.

Most teams fail not because they can't code, but because they start coding before requirements are complete. SketchFlow forces the right order: **understand first, build second.**

---

## The Pipeline

```
📸 Sketch Image
      │
      ▼
┌─────────────────────┐
│  1. Vision Extract  │  Claude reads your sketch and extracts structured product intent
│     (Claude API)    │  — screens, features, user flows, layout, open questions
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Intent Editor   │  You review and edit the extracted intent before anything proceeds
│     (Human step)    │  — correct names, add screens, remove wrong assumptions
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Product Audit   │  Claude acts as a PM reviewer — finds missing screens,
│     (Claude API)    │  broken flows, missing UI states, UX issues, industry requirements
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Blueprint       │  Architecture document: screen inventory, component inventory,
│     (Claude API)    │  design system, user flows, responsive requirements, libraries
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  5. Code Generation │  Two-pass React generation using image + intent + audit + blueprint
│     (Claude API)    │  → Download a ready-to-run ZIP with package.json + README
└─────────────────────┘
```

---

## Features

- **Claude Vision** — reads any wireframe: hand-drawn, Figma export, whiteboard photo, napkin sketch
- **Intent Editor** — fully editable before anything is locked in; add/remove screens, features, flows
- **PM-grade Audit** — missing screens, broken user flows, missing UI states, UX issues, industry compliance
- **Frontend Blueprint** — screen inventory, component inventory, design system, responsive requirements
- **Two-pass Code Generation** — core structure first, then pages and config; image-grounded output
- **Smart package.json** — named after your product, includes all libraries the blueprint recommends
- **Step-by-step README** — every generated ZIP includes a README so anyone can run it immediately
- **Truncation recovery** — if Claude's response is cut short, the parser salvages the valid portion
- **SQLite persistence** — every project step is saved; nothing is lost on restart

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| AI | Anthropic Claude (Vision + Generation) |
| Backend | Python 3.10, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Output | React + Vite + TypeScript + TailwindCSS project |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/sketchflow-v2.git
cd sketchflow-v2
```

---

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
CLAUDE_MODEL=claude-haiku-4-5-20251001
DATABASE_URL=sqlite:///./sketchflow.db
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
sketchflow-v2/
├── backend/
│   ├── main.py                        # FastAPI app entry point
│   └── app/
│       ├── api/
│       │   └── routes.py              # All API endpoints
│       ├── core/
│       │   ├── config.py              # Settings from .env
│       │   └── database.py            # SQLAlchemy + SQLite setup
│       ├── models/
│       │   └── models.py              # DB models (Project, Intent, Audit, Blueprint, Generation)
│       ├── schemas/
│       │   └── schemas.py             # Pydantic request/response schemas
│       ├── services/
│       │   ├── vision_service.py      # Stage 1: Claude Vision intent extraction
│       │   ├── audit_service.py       # Stage 3: PM audit via Claude
│       │   ├── blueprint_service.py   # Stage 4: Architecture blueprint via Claude
│       │   └── codegen_service.py     # Stage 5: Two-pass React code generation
│       └── utils/
│           └── zip_utils.py           # ZIP packaging for generated projects
│
└── frontend/
    ├── src/
    │   ├── App.tsx                    # Root component, step state machine
    │   ├── api/client.ts              # All backend API calls
    │   ├── types/index.ts             # TypeScript interfaces
    │   └── pages/
    │       ├── UploadStep.tsx         # Step 1: Sketch upload with drag-and-drop
    │       ├── IntentStep.tsx         # Step 2: Intent review and edit
    │       ├── AuditStep.tsx          # Step 3: Audit results display
    │       ├── BlueprintStep.tsx      # Step 4: Blueprint viewer
    │       └── GenerateStep.tsx       # Step 5: Generate and download
    └── vite.config.ts
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/projects/upload` | Upload sketch image, extract intent |
| `GET` | `/api/projects/{id}/intent` | Get extracted intent |
| `PATCH` | `/api/projects/{id}/intent` | Save intent edits |
| `POST` | `/api/projects/{id}/intent/confirm` | Lock in intent, proceed to audit |
| `POST` | `/api/projects/{id}/audit` | Run PM audit |
| `GET` | `/api/projects/{id}/audit` | Get audit results |
| `POST` | `/api/projects/{id}/blueprint` | Generate frontend blueprint |
| `GET` | `/api/projects/{id}/blueprint` | Get blueprint |
| `POST` | `/api/projects/{id}/generate` | Generate React frontend ZIP |
| `GET` | `/api/projects/{id}/download` | Download ZIP file |

---

## What Gets Generated

Every downloaded ZIP contains a complete, runnable React project:

```
your-project/
├── src/
│   ├── App.tsx                  # Root with React Router
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Tailwind imports
│   ├── types/index.ts           # TypeScript interfaces
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx       # App shell
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── Navbar.tsx       # Top navbar
│   │   └── ui/
│   │       ├── StatCard.tsx     # KPI card component
│   │       ├── DataTable.tsx    # Reusable data table
│   │       └── Badge.tsx        # Status badge
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Orders.tsx
│   │   └── Products.tsx
│   └── hooks/
│       └── useSidebar.ts
├── package.json                 # Named after your product, correct deps
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── README.md                    # Step-by-step run instructions
```

Run it with:

```bash
npm install
npm run dev
```

---

## How the Code Generation Works

SketchFlow uses a **two-pass generation strategy** to stay within Claude's output limits while producing a complete project:

**Pass 1** — Claude receives the sketch image + full context and generates the core structure: `App.tsx`, `Layout.tsx`, `Sidebar.tsx`, `Navbar.tsx`, `types/index.ts`, and the primary `Dashboard.tsx` page.

**Pass 2** — Claude receives the Pass 1 output as context and generates the remaining files: additional pages, reusable UI components, hooks, and all config files.

`package.json` and `README.md` are always generated in Python — not by Claude — so they are always present, valid, and reflect the actual product name and libraries from the blueprint.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Required |
| `CLAUDE_MODEL` | Claude model to use | `claude-haiku-4-5-20251001` |
| `DATABASE_URL` | SQLAlchemy DB URL | `sqlite:///./sketchflow.db` |

---

## Known Limitations

- Generated code is a strong starting point, not a finished product — expect to customise routing, data fetching, and business logic
- Very complex sketches with 15+ screens may produce incomplete output from the haiku model; switch to a larger model in `.env` for better results
- The SQLite database is local and single-user; for team use, swap to PostgreSQL via `DATABASE_URL`

---

## Built With

- [Anthropic Claude](https://anthropic.com) — Vision, reasoning, and code generation
- [FastAPI](https://fastapi.tiangolo.com) — Backend API framework
- [SQLAlchemy](https://sqlalchemy.org) — ORM and database layer
- [React](https://react.dev) — Frontend UI framework
- [Vite](https://vitejs.dev) — Build tool
- [TailwindCSS](https://tailwindcss.com) — Utility-first styling

---

<div align="center">

</div>
