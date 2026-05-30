# SketchFlow AI

Transform hand-drawn sketches into frontend-ready React applications.

SketchFlow AI bridges the gap between rough product ideas and implementation by understanding sketches, auditing product requirements, generating frontend blueprints, and creating production-ready React code.

---

## Workflow

```text
Upload Sketch
      ↓
Intent Extraction
      ↓
Product Audit
      ↓
Frontend Blueprint
      ↓
Generate React App
```

### 1. Upload Sketch

Upload a hand-drawn sketch, whiteboard photo, wireframe, or UI concept.

### 2. Intent Extraction

Claude Vision analyzes the sketch and extracts:

* Product type
* User goals
* Core features
* User roles
* Key workflows

The extracted intent can be reviewed and edited before proceeding.

### 3. Product Audit

SketchFlow reviews the product from a UX and product perspective:

* Missing screens
* Missing user flows
* Missing UI states
* UX issues
* Industry-specific requirements

### 4. Frontend Blueprint

Generate a frontend implementation document containing:

* Screen inventory
* Component inventory
* User flows
* Responsive requirements
* Accessibility requirements
* Design system recommendations

### 5. Generate React App

Using the sketch, confirmed intent, audit, and blueprint, SketchFlow generates a complete:

* React
* Vite
* TypeScript
* TailwindCSS

frontend application packaged as a downloadable ZIP.

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* TailwindCSS

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* Pydantic

### AI

* Claude Vision
* Claude Sonnet

---

## Architecture

```text
sketchflow-v2/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   │   ├── vision_service.py
│   │   │   ├── audit_service.py
│   │   │   ├── blueprint_service.py
│   │   │   └── codegen_service.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── core/
│   │   └── utils/
│   └── main.py
│
└── frontend/
    └── src/
```

---

## Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MODEL=claude-sonnet-4-5
DATABASE_URL=sqlite:///./sketchflow.db
```

---

## API Endpoints

| Method | Route                             | Description            |
| ------ | --------------------------------- | ---------------------- |
| POST   | /api/projects/upload              | Upload sketch          |
| GET    | /api/projects/{id}/intent         | Retrieve intent        |
| PATCH  | /api/projects/{id}/intent         | Update intent          |
| POST   | /api/projects/{id}/intent/confirm | Confirm intent         |
| POST   | /api/projects/{id}/audit          | Generate audit         |
| POST   | /api/projects/{id}/blueprint      | Generate blueprint     |
| POST   | /api/projects/{id}/generate       | Generate React project |
| GET    | /api/projects/{id}/download       | Download ZIP           |

---

## Why SketchFlow?

Most AI tools generate code immediately.

SketchFlow first validates the product idea, identifies missing screens and user flows, creates a frontend implementation blueprint, and only then generates React code.

**Build the right product before building the product.**
