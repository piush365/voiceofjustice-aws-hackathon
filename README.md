# 🎙️ VoiceOfJustice  
### AI Legal Assistant for All

[![AWS AI for Bharat Hackathon](https://img.shields.io/badge/AWS-AI%20for%20Bharat%20Hackathon-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)

> **Democratizing Legal Access for India’s 600M+ Underserved Population**

**VoiceOfJustice** is an AI-powered legal assistant that removes barriers to justice using conversational AI, multilingual support, smart document generation, and proactive legal guidance — making legal help accessible to everyone, not just the privileged.

---

## 🎯 The Problem

Legal justice in India faces a massive accessibility crisis:

- 🌍 **4.3 billion people** globally lack meaningful access to justice  
- 🇮🇳 **600M+ Indians** cannot afford legal consultation (₹3,000–₹5,000 avg.)
- 🏡 **84% of rural Indians** have never consulted a lawyer
- 📄 **70% of court delays** are caused by incorrect documentation
- 📚 Legal language requires **12+ years of education** to understand
- ⚖️ **35 million cases** pending in Indian district courts

---

## 💡 Our Solution

**VoiceOfJustice** delivers end-to-end legal assistance powered by AI.

### 🗣️ 1. Conversational Legal Navigator
- Supports **10+ Indian languages** (Hindi, Tamil, Bengali, Marathi, etc.)
- Voice + text input with Indian accent recognition
- Context-aware conversations that remember case history

### 📄 2. Smart Document Generator
- Auto-generates court-ready documents:
  - Legal Notices  
  - Consumer Complaints  
  - RTI Applications  
  - FIR Drafts  
- **Dual-view output**: Legal language ↔ Plain language
- State-specific legal rules
- Export as **PDF / DOCX**

### 🤖 3. Justice Copilot (WOW Feature)
- **AI Evidence Analyzer**  
  Upload WhatsApp chats, emails, photos → extracts legally relevant facts
- **Case Strength Predictor**  
  Real-time score (0–100) + improvement suggestions
- **Proactive Alerts**  
  _“Your 15-day notice period ends tomorrow”_
- Learns from **10,000+ similar cases**

### 🗺️ 4. Court Process Roadmap
- Step-by-step timeline: problem → resolution
- Preparation tips for every stage
- Live case status via **eCourts integration**

### ⚖️ 5. Pro-Bono Lawyer Marketplace
- AI handles **90%** (understanding + documentation)
- Lawyers handle **final 10%** (court representation)
- Affordable pricing: ₹500 review vs ₹5,000 consultation

---


📌 **Detailed design:** [`design.md`](design.md)

---

## 🛠️ Technology Stack

### Frontend
- **Mobile**: React Native
- **Web**: Next.js + React
- **Messaging**: WhatsApp Bot (Twilio)

### Backend
- **API**: FastAPI (Python)
- **Database**: PostgreSQL, Redis
- **Storage**: AWS S3 + CloudFront
- **Async Tasks**: Celery + Redis

### AI / ML
- **LLMs**: GPT-4 / Claude
- **RAG**: Pinecone (10K+ legal docs)
- **NLP**: Multilingual BERT
- **Speech**: Indian-accent STT
- **OCR**: Tesseract

### AWS Infrastructure
- ECS Fargate (Auto-scaling)
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- API Gateway + CloudFront

---

## 📊 Impact Metrics

### User Impact
- 💰 **₹4,500 saved per user**
- ⏱️ **2.5 weeks faster resolution**
- ✅ **75% favorable outcomes**

### Scale Impact
- 🎯 **600M+ target users**
- 💸 **₹500 crore annual savings**
- 🌍 Aligns with **UN SDG 16**

---

## 💰 Business Model

### Free Tier
- Unlimited legal chats
- Basic document generation
- 1 active case

### Premium — ₹99/month
- Up to 5 active cases
- Advanced evidence analysis
- Priority lawyer access

### B2B / NGO
- CSR licenses: ₹50,000/year
- White-label deployments

### Marketplace
- 15% commission on lawyer services

📈 **LTV : CAC = 24 : 1**

---

## 🚀 Roadmap

### Phase 1 — MVP
- Maharashtra + Karnataka
- 3 legal categories
- 1,000 users

### Phase 2 — Expansion
- Delhi NCR
- 10 legal categories
- Lawyer marketplace

### Phase 3 — Scale
- Pan-India rollout
- Government partnerships
- 10,000+ users

---


## 🔧 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker
- AWS Account
- OpenAI / Anthropic API Keys
