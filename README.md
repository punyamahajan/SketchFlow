# SketchFlow AI v3.0

Transform hand-drawn sketches into production-ready React applications.

## Architecture

```
sketchflow-v2/
├── backend/              # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/routes.py           # All 5 workflow API routes
│   │   ├── services/
│   │   │   ├── vision_service.py   # Claude Vision — intent extraction
│   │   │   ├── audit_service.py    # Product audit (UX/PM review)
│   │   │   ├── blueprint_service.py # Frontend implementation blueprint
│   │   │   └── codegen_service.py  # React/TS/Tailwind code generation
│   │   ├── models/models.py        # SQLAlchemy models
│   │   ├── schemas/schemas.py      # Pydantic schemas
│   │   ├── core/                   # Config + database
│   │   └── utils/zip_utils.py      # ZIP packaging
│   └── main.py
└── frontend/             # SketchFlow platform UI (React/Vite/TS/Tailwind)
    └── src/
        ├── pages/        # UploadStep, IntentStep, AuditStep, BlueprintStep, GenerateStep
        └── api/client.ts # API client
```

## Workflow

1. **Upload Sketch** → Claude Vision extracts intent JSON
2. **Intent Editor** → User reviews + edits + confirms intent
3. **Product Audit** → Claude reviews missing screens, flows, states, UX issues
4. **Blueprint** → Claude generates frontend implementation blueprint
5. **Generate** → Claude generates React/Vite/TypeScript/TailwindCSS project → ZIP download

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### Frontend (SketchFlow Platform UI)
```bash
cd frontend
npm install
npm run dev     # runs on :3000, proxies /api to :8000
```

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-5-20251022
DATABASE_URL=sqlite:///./sketchflow.db
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/projects/upload | Upload sketch + extract intent |
| GET | /api/projects/{id}/intent | Get intent |
| PATCH | /api/projects/{id}/intent | Edit intent |
| POST | /api/projects/{id}/intent/confirm | Confirm intent |
| POST | /api/projects/{id}/audit | Run product audit |
| POST | /api/projects/{id}/blueprint | Generate blueprint |
| POST | /api/projects/{id}/generate | Generate React frontend |
| GET | /api/projects/{id}/download | Download ZIP |

## Generated Output

Each generated project contains:
- `src/App.tsx` + routing
- `src/types/index.ts` — TypeScript interfaces
- `src/components/layout/` — Sidebar, Navbar, Layout
- `src/pages/` — All pages from the sketch
- `src/components/ui/` — Reusable components
- `src/hooks/` — Custom hooks
- `package.json`, `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`
