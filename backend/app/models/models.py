from __future__ import annotations
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return uuid.uuid4().hex


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200), default="Untitled Project")
    status: Mapped[str] = mapped_column(String(50), default="created")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    sketch: Mapped[Sketch | None] = relationship("Sketch", back_populates="project", uselist=False)
    intent: Mapped[IntentExtraction | None] = relationship("IntentExtraction", back_populates="project", uselist=False)
    audit: Mapped[ProductAudit | None] = relationship("ProductAudit", back_populates="project", uselist=False)
    blueprint: Mapped[FrontendBlueprint | None] = relationship("FrontendBlueprint", back_populates="project", uselist=False)
    generation: Mapped[CodeGeneration | None] = relationship("CodeGeneration", back_populates="project", uselist=False)


class Sketch(Base):
    __tablename__ = "sketches"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    image_path: Mapped[str] = mapped_column(String(500))
    original_filename: Mapped[str] = mapped_column(String(200))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    project: Mapped[Project] = relationship("Project", back_populates="sketch")


class IntentExtraction(Base):
    __tablename__ = "intent_extractions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), unique=True)
    extracted_intent_json: Mapped[dict] = mapped_column(JSON)
    edited_intent_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    user_confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    project: Mapped[Project] = relationship("Project", back_populates="intent")

    @property
    def final_intent(self) -> dict:
        return self.edited_intent_json or self.extracted_intent_json


class ProductAudit(Base):
    __tablename__ = "product_audits"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), unique=True)
    audit_json: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    project: Mapped[Project] = relationship("Project", back_populates="audit")


class FrontendBlueprint(Base):
    __tablename__ = "frontend_blueprints"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), unique=True)
    blueprint_json: Mapped[dict] = mapped_column(JSON)
    pdf_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    project: Mapped[Project] = relationship("Project", back_populates="blueprint")


class CodeGeneration(Base):
    __tablename__ = "code_generations"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), unique=True)
    generation_status: Mapped[str] = mapped_column(String(50), default="pending")
    zip_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    project: Mapped[Project] = relationship("Project", back_populates="generation")
