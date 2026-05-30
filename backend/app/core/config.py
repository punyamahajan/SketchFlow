from __future__ import annotations
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-5-20251022"
    DATABASE_URL: str = "sqlite:///./sketchflow.db"
    UPLOAD_DIR: Path = Path("uploads")
    GENERATED_DIR: Path = Path("generated")
    SECRET_KEY: str = "dev-secret-change-in-prod"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
settings.UPLOAD_DIR.mkdir(exist_ok=True)
settings.GENERATED_DIR.mkdir(exist_ok=True)
