from __future__ import annotations
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field


# ── Project ──────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    title: str = "Untitled Project"


class ProjectOut(BaseModel):
    id: str
    title: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Intent ───────────────────────────────────────────────────────────────────

class IntentOut(BaseModel):
    id: str
    project_id: str
    extracted_intent_json: dict[str, Any]
    edited_intent_json: dict[str, Any] | None
    user_confirmed: bool
    final_intent: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class IntentEditBody(BaseModel):
    edited_intent: dict[str, Any]


class IntentConfirmBody(BaseModel):
    edited_intent: dict[str, Any] | None = None


# ── Audit ─────────────────────────────────────────────────────────────────────

class AuditOut(BaseModel):
    id: str
    project_id: str
    audit_json: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Blueprint ─────────────────────────────────────────────────────────────────

class BlueprintOut(BaseModel):
    id: str
    project_id: str
    blueprint_json: dict[str, Any]
    pdf_path: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Code Generation ───────────────────────────────────────────────────────────

class GenerationOut(BaseModel):
    id: str
    project_id: str
    generation_status: str
    zip_url: str | None = None
    error_message: str | None
    generated_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Upload response ───────────────────────────────────────────────────────────

class UploadOut(BaseModel):
    project_id: str
    sketch_id: str
    intent: IntentOut
