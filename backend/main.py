"""SketchFlow AI — FastAPI application entry point."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.config import settings
from app.core.database import Base, engine

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SketchFlow AI", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Serve the SketchFlow platform frontend from /frontend/dist after build
# app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")
