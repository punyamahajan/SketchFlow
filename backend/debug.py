import sys
import traceback

steps = [
    ("pydantic_settings",   "from pydantic_settings import BaseSettings"),
    ("config",              "from app.core.config import settings"),
    ("database",            "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"),
    ("models",              "from app.models.models import Project, Sketch, IntentExtraction"),
    ("vision_service",      "from app.services.vision_service import extract_intent"),
    ("audit_service",       "from app.services.audit_service import run_product_audit"),
    ("blueprint_service",   "from app.services.blueprint_service import generate_blueprint"),
    ("codegen_service",     "from app.services.codegen_service import generate_react_frontend"),
    ("schemas",             "from app.schemas.schemas import IntentOut, UploadOut"),
    ("routes",              "from app.api.routes import router"),
]

for name, stmt in steps:
    try:
        exec(stmt)
        print(f"  OK  {name}")
    except Exception:
        print(f"FAIL  {name}")
        traceback.print_exc()
        sys.exit(1)

print("\nAll imports OK — the crash is inside the upload handler at runtime.")
print("Check uvicorn terminal for the full traceback above the 500 line.")