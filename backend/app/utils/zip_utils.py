"""
Utility — ZIP all generated files and save to disk.
"""
from __future__ import annotations

import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.core.config import settings


def package_project(
    project_id: str,
    files: dict[str, str],
) -> Path:
    """
    Takes { filepath: content } dict, writes a ZIP to GENERATED_DIR.
    Returns the Path to the ZIP file.
    """
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    zip_filename = f"{project_id}_{ts}.zip"
    zip_path = settings.GENERATED_DIR / zip_filename

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for filepath, content in files.items():
            zf.writestr(filepath, content)

    return zip_path
