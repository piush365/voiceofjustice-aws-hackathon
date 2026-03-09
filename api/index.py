"""
Vercel serverless entry point for the VoiceOfJustice FastAPI backend.

Vercel discovers Python serverless functions from the root-level `api/`
directory. Mangum wraps the ASGI app so it runs as a serverless function.
"""
import sys
import os

# Add the backend directory to sys.path so imports like
# `from config import ...` and `from main import app` work correctly.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from mangum import Mangum
from main import app  # noqa: E402  (import after sys.path patch)

# Mangum adapts ASGI (FastAPI/Starlette) to the AWS Lambda / Vercel handler.
handler = Mangum(app, lifespan="off")
