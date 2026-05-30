# SketchFlow AI

Transform hand-drawn sketches into frontend-ready React applications through AI-powered product analysis.

## The Problem

Most AI coding tools can generate applications from prompts or designs.

However, they assume the requirements are already complete.

In reality, teams often start building from incomplete sketches, resulting in:

* Missing user flows
* Poor UX decisions
* Scope creep
* Rework during development
* Incomplete feature sets

## The Solution

SketchFlow AI acts as an AI Product Consultant before code generation.

Instead of directly generating code from a sketch, SketchFlow:

1. Understands the product idea
2. Identifies missing screens and user flows
3. Audits the design against product best practices
4. Creates a frontend implementation blueprint
5. Generates a React application

This ensures teams build the right product before building the product.

---

## How It Works

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

Upload a:

* Hand-drawn sketch
* Whiteboard photo
* Wireframe
* UI concept

### 2. Intent Extraction

Claude Vision analyzes the sketch and extracts:

* Product type
* User goals
* Core features
* User roles
* Key workflows

Users can review and edit the extracted intent before continuing.

### 3. Product Audit

SketchFlow reviews:

* Missing screens
* Missing user flows
* Missing UI states
* UX issues
* Industry-specific requirements

Examples:

Healthcare:

* Medical History
* Emergency Contact
* Insurance Information

Fintech:

* KYC Verification
* Transaction History
* Account Recovery

E-Commerce:

* Wishlist
* Order Tracking
* Return Management

### 4. Frontend Blueprint

Generate a frontend implementation document containing:

* Screen inventory
* Component inventory
* User flows
* Responsive requirements
* Accessibility requirements
* Design system recommendations

### 5. Generate React Application

Using:

* Sketch Image
* Confirmed Intent
* Product Audit
* Frontend Blueprint

Claude generates a complete:

* React
* Vite
* TypeScript
* TailwindCSS

frontend project packaged as a downloadable ZIP.

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
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── core/
│   │   └── utils/
│   └── main.py
│
└── frontend/
    └── src/
```

### Core Services

* Vision Service → Intent Extraction
* Audit Service → Product Review
* Blueprint Service → Frontend Planning
* Codegen Service → React Generation

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

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Future Roadmap

* Figma Integration
* Multi-Screen Analysis
* Team Collaboration
* Design System Detection
* AI-Powered Refactoring
* Full Design-to-React Workflows

---

## Philosophy

Most AI tools help developers build faster.

SketchFlow helps teams build the right thing before development begins.
