"""
API routes — all 5 workflow steps.
"""
from __future__ import annotations

import asyncio
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import (
    CodeGeneration, FrontendBlueprint, IntentExtraction,
    ProductAudit, Project, Sketch,
)
from app.schemas.schemas import (
    AuditOut, BlueprintOut, GenerationOut, IntentConfirmBody,
    IntentEditBody, IntentOut, ProjectOut, UploadOut,
)
from app.services.audit_service import run_product_audit
from app.services.blueprint_service import generate_blueprint
from app.services.codegen_service import generate_react_frontend
from app.services.vision_service import extract_intent
from app.utils.zip_utils import package_project

router = APIRouter(prefix="/api")


# ── Health ─────────────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "claude": bool(settings.ANTHROPIC_API_KEY)}


# ── Step 1: Upload Sketch ──────────────────────────────────────────────────────

@router.post("/projects/upload", response_model=UploadOut)
async def upload_sketch(
    file: UploadFile = File(...),
    project_name: str | None = Form(None),
    db: Session = Depends(get_db),
):
    content = await file.read()
    if not content:
        raise HTTPException(400, "Empty file")

    # Save file
    save_path = settings.UPLOAD_DIR / f"{_uuid()}_{file.filename}"
    save_path.write_bytes(content)

    # Create project
    project = Project(title=project_name or file.filename or "Untitled Project")
    db.add(project)
    db.flush()

    # Save sketch record
    sketch = Sketch(
        project_id=project.id,
        image_path=str(save_path),
        original_filename=file.filename or "sketch",
    )
    db.add(sketch)
    db.flush()

    # Extract intent via Claude Vision
    try:
        intent_json = await asyncio.to_thread(
            extract_intent, content, file.filename, project_name
        )
    except Exception as exc:
        db.rollback()
        raise HTTPException(500, f"Intent extraction failed: {exc}")

    intent_record = IntentExtraction(
        project_id=project.id,
        extracted_intent_json=intent_json,
    )
    db.add(intent_record)
    project.status = "intent_extracted"
    if project_name:
        project.title = project_name
    db.commit()
    db.refresh(intent_record)

    return UploadOut(
        project_id=project.id,
        sketch_id=sketch.id,
        intent=IntentOut.model_validate(intent_record),
    )


# ── Step 2: Intent Editor ──────────────────────────────────────────────────────

@router.get("/projects/{project_id}/intent", response_model=IntentOut)
def get_intent(project_id: str, db: Session = Depends(get_db)):
    intent = _get_or_404(db, IntentExtraction, project_id=project_id)
    return IntentOut.model_validate(intent)


@router.patch("/projects/{project_id}/intent", response_model=IntentOut)
def edit_intent(project_id: str, body: IntentEditBody, db: Session = Depends(get_db)):
    intent = _get_or_404(db, IntentExtraction, project_id=project_id)
    intent.edited_intent_json = body.edited_intent
    db.commit()
    db.refresh(intent)
    return IntentOut.model_validate(intent)


@router.post("/projects/{project_id}/intent/confirm", response_model=IntentOut)
def confirm_intent(project_id: str, body: IntentConfirmBody, db: Session = Depends(get_db)):
    intent = _get_or_404(db, IntentExtraction, project_id=project_id)
    if body.edited_intent:
        intent.edited_intent_json = body.edited_intent
    intent.user_confirmed = True
    intent.confirmed_at = datetime.now(timezone.utc)
    project = db.get(Project, project_id)
    if project:
        project.status = "intent_confirmed"
    db.commit()
    db.refresh(intent)
    return IntentOut.model_validate(intent)


# ── Step 3: Product Audit ──────────────────────────────────────────────────────

@router.post("/projects/{project_id}/audit", response_model=AuditOut)
async def create_audit(project_id: str, db: Session = Depends(get_db)):
    intent = _get_or_404(db, IntentExtraction, project_id=project_id)
    if not intent.user_confirmed:
        raise HTTPException(400, "Confirm intent before running audit")

    try:
        audit_json = await asyncio.to_thread(run_product_audit, intent.final_intent)
    except Exception as exc:
        raise HTTPException(500, f"Audit failed: {exc}")

    # Upsert
    audit = db.query(ProductAudit).filter_by(project_id=project_id).first()
    if audit:
        audit.audit_json = audit_json
    else:
        audit = ProductAudit(project_id=project_id, audit_json=audit_json)
        db.add(audit)

    project = db.get(Project, project_id)
    if project:
        project.status = "audited"
    db.commit()
    db.refresh(audit)
    return AuditOut.model_validate(audit)


@router.get("/projects/{project_id}/audit", response_model=AuditOut)
def get_audit(project_id: str, db: Session = Depends(get_db)):
    audit = _get_or_404(db, ProductAudit, project_id=project_id)
    return AuditOut.model_validate(audit)


# ── Step 4: Blueprint ──────────────────────────────────────────────────────────

@router.post("/projects/{project_id}/blueprint", response_model=BlueprintOut)
async def create_blueprint(project_id: str, db: Session = Depends(get_db)):
    intent = _get_or_404(db, IntentExtraction, project_id=project_id)
    audit = _get_or_404(db, ProductAudit, project_id=project_id)

    try:
        bp_json = await asyncio.to_thread(
            generate_blueprint, intent.final_intent, audit.audit_json
        )
    except Exception as exc:
        raise HTTPException(500, f"Blueprint generation failed: {exc}")

    bp = db.query(FrontendBlueprint).filter_by(project_id=project_id).first()
    if bp:
        bp.blueprint_json = bp_json
    else:
        bp = FrontendBlueprint(project_id=project_id, blueprint_json=bp_json)
        db.add(bp)

    project = db.get(Project, project_id)
    if project:
        project.status = "blueprint_ready"
    db.commit()
    db.refresh(bp)
    return BlueprintOut.model_validate(bp)


@router.get("/projects/{project_id}/blueprint", response_model=BlueprintOut)
def get_blueprint(project_id: str, db: Session = Depends(get_db)):
    bp = _get_or_404(db, FrontendBlueprint, project_id=project_id)
    return BlueprintOut.model_validate(bp)


# ── Step 5: Generate React Frontend ───────────────────────────────────────────

@router.post("/projects/{project_id}/generate", response_model=GenerationOut)
async def generate_frontend(project_id: str, db: Session = Depends(get_db)):
    intent_rec = _get_or_404(db, IntentExtraction, project_id=project_id)
    audit_rec  = _get_or_404(db, ProductAudit, project_id=project_id)
    bp_rec     = _get_or_404(db, FrontendBlueprint, project_id=project_id)
    sketch_rec = db.query(Sketch).filter_by(project_id=project_id).first()

    # Create / update generation record
    gen = db.query(CodeGeneration).filter_by(project_id=project_id).first()
    if not gen:
        gen = CodeGeneration(project_id=project_id)
        db.add(gen)
    gen.generation_status = "generating"
    db.commit()

    file_bytes: bytes | None = None
    filename: str | None = None
    if sketch_rec and Path(sketch_rec.image_path).exists():
        file_bytes = Path(sketch_rec.image_path).read_bytes()
        filename = sketch_rec.original_filename

    try:
        files = await asyncio.to_thread(
            generate_react_frontend,
            intent_rec.final_intent,
            audit_rec.audit_json,
            bp_rec.blueprint_json,
            file_bytes,
            filename,
        )
        zip_path = package_project(project_id, files)
        gen.generation_status = "completed"
        gen.zip_path = str(zip_path)
        gen.generated_at = datetime.now(timezone.utc)

        project = db.get(Project, project_id)
        if project:
            project.status = "generated"

    except Exception as exc:
        gen.generation_status = "failed"
        gen.error_message = str(exc)[:500]
        db.commit()
        raise HTTPException(500, f"Code generation failed: {exc}")

    db.commit()
    db.refresh(gen)

    out = GenerationOut.model_validate(gen)
    if gen.zip_path:
        out.zip_url = f"/api/projects/{project_id}/download"
    return out


@router.get("/projects/{project_id}/download")
def download_zip(project_id: str, db: Session = Depends(get_db)):
    gen = _get_or_404(db, CodeGeneration, project_id=project_id)
    if not gen.zip_path or not Path(gen.zip_path).exists():
        raise HTTPException(404, "ZIP not found — regenerate the project")
    return FileResponse(
        path=gen.zip_path,
        media_type="application/zip",
        filename=f"sketchflow-{project_id[:8]}.zip",
    )


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return ProjectOut.model_validate(project)


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_or_404(db: Session, model, **filters):
    obj = db.query(model).filter_by(**filters).first()
    if not obj:
        raise HTTPException(404, f"{model.__name__} not found")
    return obj


def _uuid() -> str:
    import uuid
    return uuid.uuid4().hex
