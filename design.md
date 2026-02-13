# VoiceOfJustice - Design Document

## System Architecture Overview

VoiceOfJustice follows a microservices architecture with AI-native components, designed for scalability, maintainability, and cost-efficiency.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Mobile     │     Web      │   WhatsApp   │        SMS         │
│   (iOS/      │   (React/    │     Bot      │     Gateway        │
│   Android)   │   Next.js)   │   (Twilio)   │                    │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────┬──────────┘
       │              │              │                  │
       └──────────────┴──────────────┴──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API GATEWAY   │
                    │   (AWS API GW)  │
                    │   + Auth Layer  │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐    ┌─────────▼────────┐   ┌──────▼──────┐
│   USER      │    │   CONVERSATION   │   │   DOCUMENT  │
│   SERVICE   │    │     SERVICE      │   │   SERVICE   │
└──────┬──────┘    └─────────┬────────┘   └──────┬──────┘
       │                     │                     │
       │           ┌─────────▼────────┐           │
       │           │   AI ORCHESTR.   │           │
       │           │    ENGINE        │           │
       │           └─────────┬────────┘           │
       │                     │                     │
       │           ┌─────────▼────────┐           │
       │           │    LLM LAYER     │           │
       │           │  (GPT-4/Claude)  │           │
       │           │  + Local Models  │           │
       │           └─────────┬────────┘           │
       │                     │                     │
       │           ┌─────────▼────────┐           │
       │           │   KNOWLEDGE      │           │
       │           │     BASE         │           │
       │           │  (Vector DB +    │           │
       │           │   Legal Corpus)  │           │
       │           └──────────────────┘           │
       │                                           │
┌──────▼──────────────────────────────────────────▼──────┐
│              DATA LAYER                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │PostgreSQL│  │  Redis   │  │  S3      │             │
│  │ (Cases)  │  │ (Cache)  │  │(Documents│             │
│  └──────────┘  └──────────┘  └──────────┘             │
└────────────────────────────────────────────────────────┘
       │                     │                     │
┌──────▼──────┐    ┌─────────▼────────┐   ┌──────▼──────┐
│  EXTERNAL   │    │   COMMUNICATION  │   │   PAYMENT   │
│  SERVICES   │    │    SERVICES      │   │   SERVICE   │
│  (eCourts,  │    │   (Twilio, SNS)  │   │ (Razorpay)  │
│   India     │    └──────────────────┘   └─────────────┘
│   Post)     │
└─────────────┘
```

## Component Design

### 1. API Gateway Layer

**Technology:** AWS API Gateway + Lambda Authorizer  
**Responsibilities:**
- Request routing to appropriate microservices
- Authentication and authorization (JWT tokens)
- Rate limiting (100 requests/minute per user)
- Request/response transformation
- API versioning (/v1/, /v2/)

**Key Endpoints:**

```
POST   /v1/auth/signup              # User registration
POST   /v1/auth/login               # User login
POST   /v1/auth/verify-otp          # OTP verification

GET    /v1/user/profile             # User profile
PUT    /v1/user/profile             # Update profile
GET    /v1/user/cases               # List user's cases

POST   /v1/conversation/start       # Start new conversation
POST   /v1/conversation/message     # Send message
GET    /v1/conversation/{id}        # Get conversation history

POST   /v1/document/generate        # Generate document
GET    /v1/document/{id}            # Retrieve document
PUT    /v1/document/{id}/review     # Review and edit document

POST   /v1/evidence/analyze         # Analyze evidence
POST   /v1/evidence/upload          # Upload evidence files

GET    /v1/case/{id}/strength       # Get case strength score
GET    /v1/case/{id}/roadmap        # Get process roadmap

GET    /v1/lawyers/search           # Search lawyers
POST   /v1/lawyers/consult          # Request consultation

POST   /v1/payment/initiate         # Initiate payment
POST   /v1/payment/webhook          # Payment webhook
```

**Authentication Flow:**

```
┌──────┐                  ┌────────────┐                ┌──────────┐
│Client│                  │ API Gateway│                │ Auth Svc │
└──┬───┘                  └─────┬──────┘                └────┬─────┘
   │                            │                            │
   │ POST /auth/login           │                            │
   │ { phone: "9876543210" }    │                            │
   ├───────────────────────────►│                            │
   │                            │ Validate & Generate OTP    │
   │                            ├───────────────────────────►│
   │                            │                            │
   │                            │ OTP sent via SMS           │
   │                            │◄───────────────────────────┤
   │ 200 OK                     │                            │
   │ { session_id: "..." }      │                            │
   │◄───────────────────────────┤                            │
   │                            │                            │
   │ POST /auth/verify-otp      │                            │
   │ { session_id, otp: "1234" }│                            │
   ├───────────────────────────►│                            │
   │                            │ Verify OTP                 │
   │                            ├───────────────────────────►│
   │                            │                            │
   │                            │ JWT Token                  │
   │                            │◄───────────────────────────┤
   │ 200 OK                     │                            │
   │ { token: "eyJ...",         │                            │
   │   refresh_token: "..." }   │                            │
   │◄───────────────────────────┤                            │
```

### 2. User Service

**Technology:** Python (FastAPI) + PostgreSQL  
**Responsibilities:**
- User registration and profile management
- Authentication (OTP-based, phone number)
- User preferences (language, notifications)
- Case history and tracking

**Database Schema:**

```sql
-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    language_preference VARCHAR(10) DEFAULT 'en',
    location JSONB, -- {city, state, pincode}
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    profile_data JSONB -- {education_level, income_range, etc}
);

-- Cases table
CREATE TABLE cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    case_category VARCHAR(50), -- 'landlord_dispute', 'consumer_complaint', etc
    case_status VARCHAR(30), -- 'draft', 'notice_sent', 'filed', 'in_progress', 'resolved'
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB, -- All case-specific data
    confidence_score INTEGER, -- 0-100
    estimated_resolution_days INTEGER
);

-- Case timeline table
CREATE TABLE case_timeline (
    timeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id),
    event_type VARCHAR(50), -- 'created', 'document_generated', 'notice_sent', 'hearing_scheduled'
    event_date TIMESTAMP DEFAULT NOW(),
    event_data JSONB,
    notes TEXT
);

-- Evidence table
CREATE TABLE evidence (
    evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id),
    file_type VARCHAR(20), -- 'chat', 'email', 'photo', 'pdf'
    file_path VARCHAR(500), -- S3 path
    file_metadata JSONB,
    analysis_result JSONB, -- AI analysis output
    strength_rating VARCHAR(10), -- 'strong', 'moderate', 'weak'
    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

**API Implementation:**

```python
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import jwt

app = FastAPI()

class UserProfile(BaseModel):
    name: str
    email: Optional[str]
    language_preference: str = "en"
    location: dict

class CaseCreate(BaseModel):
    category: str
    title: str
    description: str

@app.get("/v1/user/profile")
async def get_user_profile(user_id: str = Depends(get_current_user)):
    """Retrieve user profile"""
    user = await db.fetch_one(
        "SELECT * FROM users WHERE user_id = $1", user_id
    )
    return user

@app.get("/v1/user/cases")
async def get_user_cases(user_id: str = Depends(get_current_user)):
    """List all cases for a user"""
    cases = await db.fetch_all(
        """SELECT c.*, 
           (SELECT COUNT(*) FROM case_timeline WHERE case_id = c.case_id) as event_count
           FROM cases c 
           WHERE user_id = $1 
           ORDER BY updated_at DESC""",
        user_id
    )
    return {"cases": cases}

@app.post("/v1/user/cases")
async def create_case(case: CaseCreate, user_id: str = Depends(get_current_user)):
    """Create a new case"""
    case_id = await db.fetch_val(
        """INSERT INTO cases (user_id, case_category, title, description, case_status)
           VALUES ($1, $2, $3, $4, 'draft')
           RETURNING case_id""",
        user_id, case.category, case.title, case.description
    )
    return {"case_id": case_id, "status": "created"}
```

### 3. Conversation Service

**Technology:** Python (FastAPI) + Redis (session storage) + Vector DB (Pinecone)  
**Responsibilities:**
- Manage conversational sessions
- Multi-turn dialogue handling
- Context maintenance across messages
- Intent classification and entity extraction

**Conversation Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Conversation State                        │
├─────────────────────────────────────────────────────────────┤
│ session_id: "abc123"                                         │
│ case_id: "case-456"                                          │
│ current_stage: "information_gathering"                       │
│ collected_data: {                                            │
│   "dispute_type": "security_deposit",                        │
│   "lease_end_date": "2024-12-31",                           │
│   "deposit_amount": 50000,                                   │
│   "landlord_name": "Mr. Sharma",                            │
│   "communication_attempts": ["email", "phone"]               │
│ }                                                            │
│ missing_fields: ["rent_agreement_copy", "deposit_receipt"]  │
│ conversation_history: [...]                                  │
└─────────────────────────────────────────────────────────────┘
```

**State Machine:**

```
                    ┌──────────────┐
                    │  INITIATED   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   GREETING   │
                    └──────┬───────┘
                           │
                    ┌──────▼────────────┐
                    │ ISSUE_DISCOVERY   │
                    └──────┬────────────┘
                           │
                    ┌──────▼────────────────┐
                    │ INFORMATION_GATHERING │
                    └──────┬────────────────┘
                           │
                    ┌──────▼────────────┐
                    │ EVIDENCE_REVIEW   │
                    └──────┬────────────┘
                           │
                    ┌──────▼──────────────┐
                    │ SOLUTION_PROPOSAL   │
                    └──────┬──────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼────────┐    ┌──────▼────────┐
         │   DOCUMENT    │    │    LAWYER     │
         │  GENERATION   │    │   REFERRAL    │
         └───────────────┘    └───────────────┘
```

**Implementation:**

```python
from enum import Enum
from typing import Dict, List, Optional
import json
import redis

class ConversationStage(Enum):
    INITIATED = "initiated"
    GREETING = "greeting"
    ISSUE_DISCOVERY = "issue_discovery"
    INFORMATION_GATHERING = "information_gathering"
    EVIDENCE_REVIEW = "evidence_review"
    SOLUTION_PROPOSAL = "solution_proposal"
    DOCUMENT_GENERATION = "document_generation"
    LAWYER_REFERRAL = "lawyer_referral"

class ConversationManager:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379)
        self.llm_client = get_llm_client()
        
    async def process_message(self, session_id: str, user_message: str, language: str):
        """Process incoming user message"""
        
        # 1. Retrieve conversation state
        state = self.get_state(session_id)
        
        # 2. Add user message to history
        state['conversation_history'].append({
            'role': 'user',
            'content': user_message,
            'timestamp': datetime.now().isoformat()
        })
        
        # 3. Determine current stage and required action
        current_stage = state.get('current_stage', ConversationStage.INITIATED)
        
        # 4. Build context-aware prompt for LLM
        system_prompt = self.build_system_prompt(current_stage, state, language)
        
        # 5. Call LLM with full context
        response = await self.llm_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                *state['conversation_history']
            ],
            functions=self.get_function_definitions(),
            temperature=0.7
        )
        
        # 6. Process LLM response
        assistant_message = response.choices[0].message
        
        # 7. If LLM called a function, execute it
        if assistant_message.function_call:
            function_result = await self.execute_function(
                assistant_message.function_call.name,
                json.loads(assistant_message.function_call.arguments)
            )
            state['collected_data'].update(function_result)
            
        # 8. Update conversation state
        state['conversation_history'].append({
            'role': 'assistant',
            'content': assistant_message.content,
            'timestamp': datetime.now().isoformat()
        })
        
        # 9. Transition to next stage if complete
        if self.is_stage_complete(current_stage, state):
            state['current_stage'] = self.get_next_stage(current_stage)
        
        # 10. Save updated state
        self.save_state(session_id, state)
        
        return {
            'message': assistant_message.content,
            'stage': state['current_stage'],
            'progress': self.calculate_progress(state),
            'suggested_actions': self.get_suggested_actions(state)
        }
    
    def build_system_prompt(self, stage: ConversationStage, state: Dict, language: str):
        """Build context-aware system prompt"""
        
        base_prompt = f"""You are VoiceOfJustice, an AI legal assistant helping users in {language}.
        
Current Conversation Stage: {stage.value}
User's Case Category: {state.get('case_category', 'unknown')}

Your goals:
1. Gather necessary information in a conversational, empathetic manner
2. Explain legal concepts in simple language (8th grade reading level)
3. Avoid legal jargon unless explaining a term
4. Be culturally sensitive and use appropriate examples

Information collected so far:
{json.dumps(state.get('collected_data', {}), indent=2)}

Information still needed:
{json.dumps(state.get('missing_fields', []), indent=2)}
"""
        
        stage_specific = {
            ConversationStage.ISSUE_DISCOVERY: """
Ask open-ended questions to understand the user's legal issue:
- What happened?
- Who is involved?
- What is the desired outcome?

Classify the issue into one of these categories:
- landlord_dispute
- consumer_complaint
- workplace_harassment
- police_complaint
- rti_application
""",
            ConversationStage.INFORMATION_GATHERING: """
Gather specific details needed for legal documentation:
- Names and contact details of parties
- Dates and timelines
- Monetary amounts
- Existing documents or agreements
- Communication attempts made

Use functions to save structured data.
""",
            ConversationStage.EVIDENCE_REVIEW: """
Review evidence with the user:
- What documents do they have?
- Are there witnesses?
- Any written communication?

Guide them on what additional evidence would strengthen their case.
"""
        }
        
        return base_prompt + stage_specific.get(stage, "")
    
    def get_function_definitions(self):
        """Define functions that LLM can call"""
        return [
            {
                "name": "save_case_detail",
                "description": "Save a specific detail about the legal case",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "field_name": {
                            "type": "string",
                            "description": "The field being saved (e.g., 'landlord_name', 'deposit_amount')"
                        },
                        "field_value": {
                            "type": "string",
                            "description": "The value for this field"
                        }
                    },
                    "required": ["field_name", "field_value"]
                }
            },
            {
                "name": "classify_legal_issue",
                "description": "Classify the user's legal issue into a category",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": ["landlord_dispute", "consumer_complaint", "workplace_harassment", "police_complaint", "rti_application"]
                        },
                        "confidence": {
                            "type": "number",
                            "description": "Confidence score 0-100"
                        }
                    },
                    "required": ["category", "confidence"]
                }
            },
            {
                "name": "request_evidence_upload",
                "description": "Request user to upload specific evidence",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "evidence_type": {
                            "type": "string",
                            "description": "Type of evidence needed"
                        },
                        "reason": {
                            "type": "string",
                            "description": "Why this evidence is important"
                        }
                    },
                    "required": ["evidence_type", "reason"]
                }
            }
        ]
```

### 4. AI Orchestration Engine

**Technology:** Python + LangChain + Celery (background tasks)  
**Responsibilities:**
- Route queries to appropriate AI models
- Implement RAG (Retrieval Augmented Generation)
- Manage prompt templates
- Handle model fallbacks and retries
- Cost optimization (local vs cloud models)

**RAG Architecture:**

```
┌──────────────────────────────────────────────────────────┐
│                    User Query                             │
│     "My landlord is not returning my security deposit"    │
└─────────────────────┬────────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │  Query Router  │
              │  (Classifier)  │
              └───────┬────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼────────┐         ┌────────▼───────┐
│  Conversational│         │  Knowledge     │
│  Response      │         │  Retrieval     │
│  (Direct LLM)  │         │  (RAG)         │
└───────┬────────┘         └────────┬───────┘
        │                           │
        │                  ┌────────▼────────┐
        │                  │  Vector Search  │
        │                  │  (Pinecone)     │
        │                  └────────┬────────┘
        │                           │
        │                  ┌────────▼────────────┐
        │                  │  Relevant Docs:     │
        │                  │  1. Rent Control    │
        │                  │     Act Section 7   │
        │                  │  2. Similar case    │
        │                  │     judgment        │
        │                  │  3. Notice template │
        │                  └────────┬────────────┘
        │                           │
        └───────────────┬───────────┘
                        │
                ┌───────▼────────┐
                │  Context       │
                │  Augmented     │
                │  Prompt        │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  LLM           │
                │  (GPT-4/       │
                │   Claude)      │
                └───────┬────────┘
                        │
                ┌───────▼────────────────────┐
                │  Grounded Response with    │
                │  Legal Citations           │
                └────────────────────────────┘
```

**Knowledge Base Structure:**

```python
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

class LegalKnowledgeBase:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = Pinecone.from_existing_index(
            index_name="voiceofjustice-legal-kb",
            embedding=self.embeddings
        )
    
    def retrieve_relevant_documents(self, query: str, case_category: str, k: int = 5):
        """Retrieve most relevant legal documents"""
        
        # Add metadata filters for better precision
        filter_dict = {
            "category": case_category,
            "jurisdiction": "India"  # Can be state-specific later
        }
        
        results = self.vector_store.similarity_search(
            query=query,
            k=k,
            filter=filter_dict
        )
        
        return results
    
    def build_augmented_context(self, query: str, case_data: dict):
        """Build context for RAG"""
        
        # 1. Retrieve relevant documents
        docs = self.retrieve_relevant_documents(
            query=query,
            case_category=case_data.get('category'),
            k=5
        )
        
        # 2. Format context
        context_parts = []
        for i, doc in enumerate(docs):
            context_parts.append(f"""
[Source {i+1}]: {doc.metadata.get('source_title')}
{doc.page_content}
[End Source {i+1}]
            """)
        
        # 3. Add case-specific context
        case_context = f"""
User's Case Details:
- Category: {case_data.get('category')}
- Key Facts: {case_data.get('description')}
- Location: {case_data.get('location')}
        """
        
        return {
            'legal_context': "\n".join(context_parts),
            'case_context': case_context
        }

# Legal document ingestion pipeline
class KnowledgeBaseIngestion:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
    def ingest_legal_documents(self):
        """Ingest legal documents into knowledge base"""
        
        sources = [
            {
                'type': 'statute',
                'files': ['ipc.txt', 'crpc.txt', 'rent_control_act.txt'],
                'category': 'primary_law'
            },
            {
                'type': 'case_law',
                'files': ['landlord_cases.json'],
                'category': 'precedents'
            },
            {
                'type': 'templates',
                'files': ['legal_notices/*', 'complaints/*'],
                'category': 'documents'
            }
        ]
        
        for source in sources:
            documents = self.load_documents(source['files'])
            chunks = self.text_splitter.split_documents(documents)
            
            # Add metadata
            for chunk in chunks:
                chunk.metadata.update({
                    'source_type': source['type'],
                    'category': source['category']
                })
            
            # Ingest into vector store
            self.vector_store.add_documents(chunks)
```

**Model Orchestration:**

```python
class ModelOrchestrator:
    def __init__(self):
        self.primary_model = "gpt-4"  # High accuracy, expensive
        self.secondary_model = "gpt-3.5-turbo"  # Fast, cheaper
        self.local_model = "mistral-7b"  # Free, privacy-friendly
        
    async def route_query(self, query: str, context: dict):
        """Intelligently route to appropriate model"""
        
        # Simple classification rules (can be ML model)
        query_complexity = self.assess_complexity(query, context)
        
        if query_complexity == "high":
            # Complex legal reasoning → GPT-4
            return await self.call_primary_model(query, context)
        elif query_complexity == "medium":
            # Standard queries → GPT-3.5
            return await self.call_secondary_model(query, context)
        else:
            # Simple FAQs, greetings → Local model
            return await self.call_local_model(query, context)
    
    def assess_complexity(self, query: str, context: dict):
        """Assess query complexity"""
        
        # High complexity indicators
        high_complexity_keywords = [
            'interpret', 'legal precedent', 'case law',
            'conflicting', 'exception', 'jurisdiction'
        ]
        
        # Document generation always high complexity
        if context.get('task_type') == 'document_generation':
            return "high"
        
        # Check for legal complexity keywords
        if any(keyword in query.lower() for keyword in high_complexity_keywords):
            return "high"
        
        # Long queries tend to be complex
        if len(query.split()) > 50:
            return "high"
        
        # Short, simple queries
        if len(query.split()) < 10:
            return "low"
        
        return "medium"
```

### 5. Document Generation Service

**Technology:** Python + python-docx + PDFKit + Template Engine (Jinja2)  
**Responsibilities:**
- Generate legal documents from structured data
- Apply appropriate templates based on jurisdiction
- Format documents per legal requirements
- Support multiple output formats (PDF, DOCX)

**Document Generation Pipeline:**

```
┌────────────────────────────────────────────────────────┐
│  Input: Case Data + Document Type                      │
└─────────────────────┬──────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │ Template       │
              │ Selection      │
              │ (State + Type) │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ Data Validation│
              │ & Enrichment   │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ LLM Content    │
              │ Generation     │
              │ (if needed)    │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ Template       │
              │ Rendering      │
              │ (Jinja2)       │
              └───────┬────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
 ┌───────▼────────┐      ┌────────▼────────┐
 │ DOCX Generation│      │  PDF Generation │
 │ (python-docx)  │      │  (PDFKit)       │
 └───────┬────────┘      └────────┬────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼────────┐
              │ Post-processing│
              │ - Add headers  │
              │ - Add footers  │
              │ - Watermark    │
              └───────┬────────┘
                      │
              ┌───────▼────────┐
              │ Store in S3    │
              └───────┬────────┘
                      │
              ┌───────▼────────────────┐
              │ Return Document URL    │
              └────────────────────────┘
```

**Implementation:**

```python
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from jinja2 import Environment, FileSystemLoader
import pdfkit

class DocumentGenerator:
    def __init__(self):
        self.template_env = Environment(
            loader=FileSystemLoader('templates/')
        )
        self.llm_client = get_llm_client()
    
    async def generate_document(
        self,
        document_type: str,
        case_data: dict,
        user_data: dict,
        format: str = "pdf"
    ):
        """Generate legal document"""
        
        # 1. Select appropriate template
        template_path = self.select_template(
            document_type=document_type,
            jurisdiction=case_data.get('jurisdiction', 'Maharashtra')
        )
        
        # 2. Enrich data with AI-generated content if needed
        enriched_data = await self.enrich_data(case_data, document_type)
        
        # 3. Render template
        if format == "docx":
            doc = self.generate_docx(template_path, enriched_data, user_data)
            file_path = f"documents/{case_data['case_id']}_{document_type}.docx"
            doc.save(file_path)
        else:  # PDF
            html_content = self.generate_html(template_path, enriched_data, user_data)
            file_path = f"documents/{case_data['case_id']}_{document_type}.pdf"
            pdfkit.from_string(html_content, file_path)
        
        # 4. Upload to S3
        s3_url = await self.upload_to_s3(file_path)
        
        # 5. Save document record
        await self.save_document_record(case_data['case_id'], document_type, s3_url)
        
        return {
            'document_id': str(uuid.uuid4()),
            'document_url': s3_url,
            'document_type': document_type,
            'format': format
        }
    
    async def enrich_data(self, case_data: dict, document_type: str):
        """Use AI to generate specific sections"""
        
        enriched = case_data.copy()
        
        if document_type == "legal_notice":
            # Generate formal legal language for notice
            prompt = f"""
Based on the following case details, draft the main body of a legal notice
in formal but clear language:

Case Type: {case_data['category']}
Facts: {case_data['description']}
Desired Outcome: {case_data.get('desired_outcome')}

Structure:
1. Reference to agreement/relationship
2. Statement of breach/issue
3. Legal basis (cite relevant sections)
4. Demand/request
5. Timeline for response
6. Consequences of non-compliance

Write in formal legal language appropriate for India.
"""
            
            response = await self.llm_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3  # Lower for formal documents
            )
            
            enriched['notice_body'] = response.choices[0].message.content
        
        # Add legal citations
        enriched['legal_citations'] = self.get_relevant_citations(case_data['category'])
        
        # Add formatted dates
        enriched['issue_date'] = datetime.now().strftime("%d/%m/%Y")
        enriched['response_deadline'] = (datetime.now() + timedelta(days=15)).strftime("%d/%m/%Y")
        
        return enriched
    
    def generate_docx(self, template_path: str, case_data: dict, user_data: dict):
        """Generate DOCX document"""
        
        doc = Document()
        
        # Set document margins
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(1)
            section.bottom_margin = Inches(1)
            section.left_margin = Inches(1)
            section.right_margin = Inches(1)
        
        # Add header
        header = doc.sections[0].header
        header_para = header.paragraphs[0]
        header_para.text = "LEGAL NOTICE"
        header_para.alignment = 1  # Center
        
        # Add sender details
        doc.add_paragraph(f"From:")
        doc.add_paragraph(f"{user_data['name']}")
        doc.add_paragraph(f"{user_data['address']}")
        doc.add_paragraph(f"Phone: {user_data['phone']}")
        doc.add_paragraph(f"Email: {user_data.get('email', 'N/A')}")
        doc.add_paragraph()
        
        # Add recipient details
        doc.add_paragraph(f"To:")
        doc.add_paragraph(f"{case_data['recipient_name']}")
        doc.add_paragraph(f"{case_data['recipient_address']}")
        doc.add_paragraph()
        
        # Add date
        doc.add_paragraph(f"Date: {case_data['issue_date']}")
        doc.add_paragraph()
        
        # Add subject
        subject_para = doc.add_paragraph()
        subject_para.add_run("Subject: ").bold = True
        subject_para.add_run(f"{case_data['subject']}")
        doc.add_paragraph()
        
        # Add main content
        doc.add_paragraph("Dear Sir/Madam,")
        doc.add_paragraph()
        
        # Split notice body into paragraphs
        for paragraph in case_data['notice_body'].split('\n\n'):
            if paragraph.strip():
                doc.add_paragraph(paragraph.strip())
        
        # Add legal citations
        doc.add_paragraph()
        cite_para = doc.add_paragraph()
        cite_para.add_run("Legal Basis: ").bold = True
        for citation in case_data.get('legal_citations', []):
            doc.add_paragraph(f"• {citation}", style='List Bullet')
        
        # Add demand/timeline
        doc.add_paragraph()
        doc.add_paragraph(
            f"You are hereby required to comply with the above demand within 15 days "
            f"from the date of receipt of this notice, failing which appropriate legal "
            f"action will be initiated against you without further notice."
        )
        
        # Add closing
        doc.add_paragraph()
        doc.add_paragraph("Yours faithfully,")
        doc.add_paragraph()
        doc.add_paragraph()
        doc.add_paragraph(user_data['name'])
        
        # Add footer
        footer = doc.sections[0].footer
        footer_para = footer.paragraphs[0]
        footer_para.text = "Generated by VoiceOfJustice | This is a computer-generated document"
        footer_para.alignment = 1  # Center
        
        return doc
    
    def get_relevant_citations(self, category: str):
        """Get relevant legal citations for category"""
        
        citations_map = {
            'landlord_dispute': [
                "Maharashtra Rent Control Act, 1999 - Section 7 (Return of Deposit)",
                "Transfer of Property Act, 1882 - Section 108 (Rights of Lessee)",
                "Indian Contract Act, 1872 - Section 73 (Compensation for breach)"
            ],
            'consumer_complaint': [
                "Consumer Protection Act, 2019 - Section 2(7) (Definition of Deficiency)",
                "Consumer Protection Act, 2019 - Section 34 (Jurisdiction of District Commission)",
                "Consumer Protection Act, 2019 - Section 37 (Manner of Appeal)"
            ],
            # Add more categories...
        }
        
        return citations_map.get(category, [])
```

**Document Templates:**

```python
# templates/legal_notice_landlord.html (Jinja2 template)
"""
<!DOCTYPE html>
<html>
<head>
    <style>
        @page {
            size: A4;
            margin: 1in;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 15px;
        }
        .bold {
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">LEGAL NOTICE</div>
    
    <div class="section">
        <p><span class="bold">From:</span></p>
        <p>{{ user_name }}</p>
        <p>{{ user_address }}</p>
        <p>Phone: {{ user_phone }}</p>
        <p>Email: {{ user_email }}</p>
    </div>
    
    <div class="section">
        <p><span class="bold">To:</span></p>
        <p>{{ landlord_name }}</p>
        <p>{{ landlord_address }}</p>
    </div>
    
    <div class="section">
        <p><span class="bold">Date:</span> {{ issue_date }}</p>
    </div>
    
    <div class="section">
        <p><span class="bold">Subject:</span> Legal Notice for Return of Security Deposit</p>
    </div>
    
    <div class="section">
        <p>Dear Sir/Madam,</p>
        <p>{{ notice_body }}</p>
    </div>
    
    <div class="section">
        <p><span class="bold">Legal Basis:</span></p>
        <ul>
        {% for citation in legal_citations %}
            <li>{{ citation }}</li>
        {% endfor %}
        </ul>
    </div>
    
    <div class="section">
        <p>You are hereby required to return the security deposit amount of 
        Rs. {{ deposit_amount }}/- within 15 days from the date of receipt 
        of this notice, failing which appropriate legal action will be initiated.</p>
    </div>
    
    <div class="section">
        <p>Yours faithfully,</p>
        <p><br><br></p>
        <p>{{ user_name }}</p>
    </div>
    
    <div style="text-align: center; font-size: 10pt; margin-top: 30px; color: #666;">
        Generated by VoiceOfJustice | This is a computer-generated document
    </div>
</body>
</html>
"""
```

### 6. Evidence Analysis Service

**Technology:** Python + OpenAI Vision API + OCR (Tesseract) + NLP  
**Responsibilities:**
- Analyze uploaded files (images, PDFs, text)
- Extract relevant information
- Assess evidence strength
- Organize chronologically

**Evidence Analysis Flow:**

```python
import pytesseract
from PIL import Image
import PyPDF2
from langchain.document_loaders import UnstructuredFileLoader

class EvidenceAnalyzer:
    def __init__(self):
        self.llm_client = get_llm_client()
        self.vision_model = "gpt-4-vision"
    
    async def analyze_evidence(
        self,
        case_id: str,
        file_path: str,
        file_type: str
    ):
        """Analyze uploaded evidence"""
        
        # 1. Extract content based on file type
        extracted_content = await self.extract_content(file_path, file_type)
        
        # 2. Analyze content with AI
        analysis_result = await self.ai_analysis(extracted_content, file_type)
        
        # 3. Assess strength
        strength_rating = self.assess_strength(analysis_result)
        
        # 4. Store results
        evidence_record = {
            'case_id': case_id,
            'file_path': file_path,
            'file_type': file_type,
            'extracted_content': extracted_content,
            'analysis': analysis_result,
            'strength_rating': strength_rating,
            'timestamp': datetime.now().isoformat()
        }
        
        await self.store_evidence(evidence_record)
        
        return evidence_record
    
    async def extract_content(self, file_path: str, file_type: str):
        """Extract content from various file types"""
        
        if file_type in ['jpg', 'jpeg', 'png']:
            # OCR for images
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return {'type': 'text', 'content': text}
        
        elif file_type == 'pdf':
            # PDF extraction
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
            return {'type': 'text', 'content': text}
        
        elif file_type in ['txt', 'doc', 'docx']:
            # Text files
            loader = UnstructuredFileLoader(file_path)
            documents = loader.load()
            return {'type': 'text', 'content': documents[0].page_content}
        
        elif file_type in ['mp4', 'mov', 'avi']:
            # Future: Video analysis
            return {'type': 'video', 'content': 'Video analysis not yet supported'}
        
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    async def ai_analysis(self, extracted_content: dict, file_type: str):
        """AI-powered content analysis"""
        
        prompt = f"""
Analyze the following evidence for a legal case:

Content: {extracted_content['content']}

Please provide:
1. **Summary**: Brief description of what this evidence shows
2. **Key Points**: Bullet points of legally relevant information
3. **Dates Mentioned**: Extract any dates mentioned
4. **Parties Mentioned**: Extract names of people/companies mentioned
5. **Commitments/Agreements**: Any promises or agreements mentioned
6. **Potential Issues**: Any weaknesses or problems with this evidence
7. **Relevance**: How this evidence could help the case

Be specific and extract actual quotes where relevant.
"""
        
        response = await self.llm_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        return response.choices[0].message.content
    
    def assess_strength(self, analysis: str):
        """Assess evidence strength"""
        
        # Simple heuristic (can be ML model)
        strong_indicators = [
            'written agreement', 'signed', 'dated',
            'witness', 'acknowledged', 'receipt'
        ]
        
        weak_indicators = [
            'unclear', 'illegible', 'no date',
            'unsigned', 'verbal', 'hearsay'
        ]
        
        strong_count = sum(1 for indicator in strong_indicators if indicator in analysis.lower())
        weak_count = sum(1 for indicator in weak_indicators if indicator in analysis.lower())
        
        if strong_count >= 3 and weak_count == 0:
            return 'strong'
        elif weak_count >= 2:
            return 'weak'
        else:
            return 'moderate'
```

## Deployment Architecture

### Production Infrastructure (AWS)

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              CloudFront (CDN)                            │
│              - Static assets caching                     │
│              - HTTPS termination                         │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼────────┐         ┌─────────▼────────┐
│   S3 (Static)  │         │  Application     │
│   - Web app    │         │  Load Balancer   │
│   - Documents  │         │  (ALB)           │
└────────────────┘         └─────────┬────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                  ┌───────▼────────┐   ┌────────▼───────┐
                  │   ECS Fargate  │   │  ECS Fargate   │
                  │   (API Nodes)  │   │  (API Nodes)   │
                  │   2-10 tasks   │   │  Auto-scaling  │
                  └───────┬────────┘   └────────┬───────┘
                          │                     │
                          └──────────┬──────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
        ┌───────▼────────┐  ┌────────▼────────┐ ┌───────▼────────┐
        │  RDS PostgreSQL│  │  ElastiCache    │ │  S3 (Docs)     │
        │  Multi-AZ      │  │  (Redis)        │ │  + CloudFront  │
        └────────────────┘  └─────────────────┘ └────────────────┘
```

**Estimated Costs (Monthly):**

- ALB: $20
- ECS Fargate (2 tasks × 0.5 vCPU, 1GB RAM): $30
- RDS PostgreSQL (db.t3.small, Multi-AZ): $65
- ElastiCache Redis (cache.t3.micro): $15
- S3 + CloudFront: $10
- OpenAI API (10K requests): $50
- **Total: ~$190/month** (scales with usage)

## Data Models

### Complete Database Schema

```sql
-- Users and Authentication
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    language_preference VARCHAR(10) DEFAULT 'en',
    location JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    profile_data JSONB,
    INDEX idx_phone (phone_number),
    INDEX idx_email (email)
);

CREATE TABLE auth_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cases
CREATE TABLE cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    case_category VARCHAR(50),
    case_status VARCHAR(30),
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB,
    confidence_score INTEGER,
    estimated_resolution_days INTEGER,
    INDEX idx_user_cases (user_id, updated_at DESC),
    INDEX idx_category (case_category),
    INDEX idx_status (case_status)
);

-- Conversations
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id),
    user_id UUID REFERENCES users(user_id),
    session_data JSONB,
    current_stage VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(conversation_id),
    role VARCHAR(20), -- 'user' or 'assistant'
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_conversation_messages (conversation_id, created_at)
);

-- Documents
CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id),
    document_type VARCHAR(50),
    file_path VARCHAR(500),
    file_format VARCHAR(10),
    version INTEGER DEFAULT 1,
    generated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Evidence
CREATE TABLE evidence (
    evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id),
    file_type VARCHAR(20),
    file_path VARCHAR(500),
    file_metadata JSONB,
    analysis_result JSONB,
    strength_rating VARCHAR(10),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Lawyers
CREATE TABLE lawyers (
    lawyer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    bar_registration VARCHAR(50),
    specializations TEXT[],
    languages TEXT[],
    location JSONB,
    rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    profile_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE consultations (
    consultation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id),
    lawyer_id UUID REFERENCES lawyers(lawyer_id),
    user_id UUID REFERENCES users(user_id),
    consultation_type VARCHAR(20), -- 'chat', 'call', 'meeting'
    status VARCHAR(20),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    amount DECIMAL(10,2),
    notes TEXT
);

-- Timeline
CREATE TABLE case_timeline (
    timeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(case_id),
    event_type VARCHAR(50),
    event_date TIMESTAMP DEFAULT NOW(),
    event_data JSONB,
    notes TEXT
);
```

## Security Design

### Authentication Flow

1. **Phone Number + OTP**
   - User enters phone number
   - System generates 6-digit OTP (valid 10 minutes)
   - OTP sent via Twilio SMS
   - User enters OTP
   - System validates and issues JWT token

2. **JWT Token Structure**
```json
{
  "user_id": "uuid",
  "phone": "+919876543210",
  "iat": 1234567890,
  "exp": 1234654290,
  "roles": ["user"]
}
```

3. **Token Refresh**
   - Access token: 1 hour validity
   - Refresh token: 30 days validity
   - Automatic refresh before expiry

### Data Protection

- **Encryption at Rest**: AES-256 for all sensitive data in database
- **Encryption in Transit**: TLS 1.3 for all API calls
- **PII Handling**: Personal data encrypted separately with user-specific keys
- **Document Security**: Pre-signed S3 URLs with 1-hour expiry
- **Audit Logging**: All data access logged for compliance

## Performance Optimization

### Caching Strategy

```python
# Redis caching layers
CACHE_LAYERS = {
    'user_profile': 3600,  # 1 hour
    'case_metadata': 1800,  # 30 minutes
    'legal_knowledge': 86400,  # 24 hours
    'document_templates': 604800,  # 7 days
}

# Example: User profile caching
async def get_user_profile(user_id: str):
    # Check cache first
    cache_key = f"user:profile:{user_id}"
    cached = await redis.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    # Cache miss - fetch from DB
    profile = await db.fetch_one(
        "SELECT * FROM users WHERE user_id = $1",
        user_id
    )
    
    # Store in cache
    await redis.setex(
        cache_key,
        CACHE_LAYERS['user_profile'],
        json.dumps(profile)
    )
    
    return profile
```

### Database Indexing

```sql
-- Optimize frequent queries
CREATE INDEX CONCURRENTLY idx_cases_user_updated ON cases(user_id, updated_at DESC);
CREATE INDEX CONCURRENTLY idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX CONCURRENTLY idx_evidence_case ON evidence(case_id, uploaded_at DESC);

-- Full-text search for cases
CREATE INDEX idx_cases_fulltext ON cases USING gin(to_tsvector('english', title || ' ' || description));
```

## Monitoring and Observability

### Key Metrics

```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge

# Business metrics
cases_created = Counter('cases_created_total', 'Total cases created')
documents_generated = Counter('documents_generated_total', 'Total documents generated', ['type'])
consultations_booked = Counter('consultations_booked_total', 'Total consultations booked')

# Performance metrics
api_latency = Histogram('api_request_duration_seconds', 'API request duration', ['endpoint'])
llm_latency = Histogram('llm_request_duration_seconds', 'LLM request duration', ['model'])

# System metrics
active_users = Gauge('active_users', 'Currently active users')
pending_cases = Gauge('pending_cases', 'Cases in progress')
```

### Logging

```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self):
        self.logger = logging.getLogger('voiceofjustice')
    
    def log_event(self, event_type: str, data: dict, level: str = 'info'):
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'data': data,
            'level': level
        }
        
        getattr(self.logger, level)(json.dumps(log_entry))

# Usage
logger = StructuredLogger()
logger.log_event('document_generated', {
    'case_id': case_id,
    'document_type': 'legal_notice',
    'duration_ms': 1234
})
```

## Testing Strategy

### Test Pyramid

```
        ┌─────────────┐
        │  E2E Tests  │  (10% - Selenium/Cypress)
        │  (< 50)     │
        └─────────────┘
       ┌───────────────┐
       │Integration    │  (20% - API tests)
       │Tests (< 200)  │
       └───────────────┘
     ┌────────────────────┐
     │  Unit Tests        │  (70% - Pytest)
     │  (> 500)           │
     └────────────────────┘
```

### Example Test Cases

```python
import pytest
from fastapi.testclient import TestClient

def test_conversation_flow():
    """Test complete conversation flow"""
    client = TestClient(app)
    
    # Start conversation
    response = client.post("/v1/conversation/start", json={
        "language": "en",
        "case_category": "landlord_dispute"
    })
    assert response.status_code == 200
    session_id = response.json()['session_id']
    
    # Send first message
    response = client.post(f"/v1/conversation/message", json={
        "session_id": session_id,
        "message": "My landlord is not returning my deposit"
    })
    assert response.status_code == 200
    assert 'message' in response.json()
    
    # Check conversation state
    response = client.get(f"/v1/conversation/{session_id}")
    assert response.json()['stage'] == 'information_gathering'

def test_document_generation():
    """Test document generation"""
    case_data = {
        'category': 'landlord_dispute',
        'user_name': 'Test User',
        'landlord_name': 'Test Landlord',
        'deposit_amount': 50000
    }
    
    doc_generator = DocumentGenerator()
    result = await doc_generator.generate_document(
        document_type='legal_notice',
        case_data=case_data,
        user_data={'name': 'Test User'},
        format='pdf'
    )
    
    assert result['document_type'] == 'legal_notice'
    assert result['document_url'].startswith('https://')
```

## Deployment Process

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          pip install -r requirements.txt
          pytest tests/ --cov=src --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v2

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t voiceofjustice:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker tag voiceofjustice:${{ github.sha }} $ECR_REGISTRY/voiceofjustice:${{ github.sha }}
          docker push $ECR_REGISTRY/voiceofjustice:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster voiceofjustice-prod \
            --service api \
            --force-new-deployment \
            --task-definition voiceofjustice-api:${{ github.sha }}
```

---

## Appendix: API Examples

### Complete API Request/Response Examples

**1. Start Conversation**

```http
POST /v1/conversation/start
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "language": "hi",
  "initial_message": "Mera malik mera deposit nahi de raha"
}

Response 200:
{
  "conversation_id": "conv-123",
  "session_id": "sess-456",
  "message": "मैं समझता हूँ, यह निराशाजनक है। क्या आपके पास रेंट एग्रीमेंट है?",
  "stage": "information_gathering",
  "suggested_actions": ["Yes", "No"]
}
```

**2. Generate Document**

```http
POST /v1/document/generate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "case_id": "case-789",
  "document_type": "legal_notice",
  "format": "pdf"
}

Response 200:
{
  "document_id": "doc-abc",
  "document_url": "https://voiceofjustice.s3.amazonaws.com/...",
  "expires_at": "2024-02-14T10:00:00Z",
  "preview_url": "https://voiceofjustice.s3.amazonaws.com/...-preview.jpg"
}
```

This design document provides a comprehensive blueprint for building VoiceOfJustice. The architecture is scalable, secure, and optimized for the Indian legal context while remaining cost-effective for an MVP.
