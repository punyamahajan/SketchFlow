"""SketchFlow AI — FastAPI application entry point."""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SketchFlow AI", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    dist = Path(__file__).parent.parent / "frontend" / "dist"
    if dist.exists():
        return RedirectResponse("/app")
    return {
        "message": "SketchFlow AI backend is running.",
        "docs": "http://127.0.0.1:8000/docs",
        "frontend": "Run `cd frontend && npm install && npm run dev` → open http://localhost:3000",
        "api_health": "http://127.0.0.1:8000/api/health",
    }


_dist = Path(__file__).parent.parent / "frontend" / "dist"
if _dist.exists():
    app.mount("/app", StaticFiles(directory=str(_dist), html=True), name="frontend")