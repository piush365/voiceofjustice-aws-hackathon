"""
Vercel serverless entry point for the VoiceOfJustice FastAPI backend.

Vercel looks for api/index.py (relative to the backend directory root as
configured in vercel.json). Mangum wraps the ASGI app so it runs as a
serverless function.
"""
import sys
import os

# Make sure the backend package root is on sys.path so imports like
# `from config import ...` work correctly inside the function.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from mangum import Mangum
from main import app  # noqa: E402  (import after sys.path patch)

# Mangum adapts ASGI (FastAPI/Starlette) to the AWS Lambda / Vercel handler.
handler = Mangum(app, lifespan="off")
