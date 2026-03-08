from typing import Optional, Dict, List

from pydantic import BaseModel, field_validator

QUESTIONS: List[str] = [
    "What is your full name?",
    "What is the security deposit amount not returned (in ₹)?",
    "When did your tenancy/lease end? (DD/MM/YYYY)",
    "What is your landlord's full name?",
    "What is your landlord's complete address?",
]


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Message cannot be empty.")
        if len(value) > 2_000:
            raise ValueError("Message is too long. Please keep it under 2000 characters.")
        return value


class ChatResponse(BaseModel):
    session_id: str
    ai_response: str
    question_number: int
    total_questions: int
    is_complete: bool


class DocumentRequest(BaseModel):
    session_id: str

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Session ID is required.")
        if len(value) > 64:
            raise ValueError("Session ID looks invalid.")
        return value


class DocumentResponse(BaseModel):
    status: str
    document: str
    message: str
    session_id: str


ConversationStore = Dict[str, dict]

