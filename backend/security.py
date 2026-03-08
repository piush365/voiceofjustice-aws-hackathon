from datetime import datetime, timedelta
from time import time
from typing import Dict, List, Optional

from fastapi import Header, HTTPException, Request, status

from config import API_KEY

# In‑memory rate limit storage (per identifier).
_rate_limit_store: Dict[str, List[float]] = {}

# Counter to trigger periodic pruning of stale rate-limit entries.
_prune_counter = 0
_PRUNE_EVERY_N_CALLS = 100

# Session lifetime before forcing restart (defence in depth).
SESSION_TTL_MINUTES = 60

# Maximum sliding window we track (used for pruning).
_MAX_WINDOW_SECONDS = 300


def verify_api_key(x_api_key: Optional[str] = Header(None, alias="X-API-Key")) -> None:
  """
  Simple API key check.

  - If API_KEY is not configured, auth is effectively disabled (local dev).
  - If configured, all protected endpoints must include matching X-API-Key.
  """
  if API_KEY is None:
    return

  if not x_api_key or x_api_key != API_KEY:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or missing API key.",
    )


def get_client_identifier(request: Request) -> str:
  """
  Derive a stable identifier for rate limiting (IP, possibly behind proxy).
  """
  forwarded_for = request.headers.get("x-forwarded-for")
  if forwarded_for:
    # Take the first IP in the list.
    return forwarded_for.split(",")[0].strip()

  return request.client.host if request.client else "unknown"


def _prune_rate_limit_store() -> None:
  """Remove stale entries from the rate-limit store to prevent memory leaks."""
  cutoff = time() - _MAX_WINDOW_SECONDS
  stale_keys = []
  for key, timestamps in _rate_limit_store.items():
    fresh = [t for t in timestamps if t >= cutoff]
    if fresh:
      _rate_limit_store[key] = fresh
    else:
      stale_keys.append(key)
  for key in stale_keys:
    del _rate_limit_store[key]


def check_rate_limit(identifier: str, limit: int, window_seconds: int) -> None:
  """
  Basic sliding‑window rate limiting.

  - identifier: typically IP or session ID.
  - limit: maximum allowed hits in window.
  - window_seconds: size of sliding window.
  """
  global _prune_counter
  _prune_counter += 1
  if _prune_counter >= _PRUNE_EVERY_N_CALLS:
    _prune_counter = 0
    _prune_rate_limit_store()

  now = time()
  window_start = now - window_seconds
  timestamps = _rate_limit_store.get(identifier, [])

  # Drop old entries outside the window.
  timestamps = [t for t in timestamps if t >= window_start]

  if len(timestamps) >= limit:
    raise HTTPException(
      status_code=status.HTTP_429_TOO_MANY_REQUESTS,
      detail="Too many requests. Please slow down.",
    )

  timestamps.append(now)
  _rate_limit_store[identifier] = timestamps


def is_session_expired(started_at_iso: str) -> bool:
  """
  Return True if the session start timestamp is older than SESSION_TTL_MINUTES.
  """
  try:
    started_at = datetime.fromisoformat(started_at_iso)
  except Exception:
    return False

  return datetime.now(started_at.tzinfo) - started_at > timedelta(
    minutes=SESSION_TTL_MINUTES
  )

