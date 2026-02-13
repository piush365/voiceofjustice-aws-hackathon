# VoiceOfJustice - Requirements Specification

## Project Overview

**Project Name:** VoiceOfJustice  
**Category:** AI for Communities, Access & Public Impact  
**Target Platform:** Web, Mobile (iOS/Android), WhatsApp Bot  
**Primary Goal:** Democratize legal access for underserved communities through AI-powered legal navigation and document automation

## Problem Statement

### The Justice Gap Crisis

**Global Context:**
- 4.3 billion people globally lack meaningful access to justice (World Justice Project, 2024)
- Legal services remain inaccessible due to cost, complexity, and language barriers

**India-Specific Context:**
- 600+ million Indians cannot afford legal consultation (average cost: ₹3,000-5,000)
- 84% of rural Indians have never consulted a lawyer despite facing legal issues
- 35 million cases pending in district courts, 70% due to improper documentation
- Legal language requires 12+ years of education to comprehend
- Regional language support is virtually non-existent in legal services

**User Pain Points:**
1. Lack of awareness about legal rights and remedies
2. Inability to afford lawyers for "small" disputes (landlord, consumer, workplace)
3. Intimidation from complex legal forms (50+ fields, legal jargon)
4. Uncertainty about where to file cases and what documents are needed
5. No guidance through the legal process after filing

## Target Users

### Primary Users
1. **Low-to-middle income individuals** (annual income < ₹5 lakhs)
   - Age: 18-60 years
   - Education: 5-12 years of schooling
   - Digital literacy: Basic smartphone usage
   - Primary issues: Landlord disputes, consumer complaints, workplace harassment

2. **Rural population**
   - Limited English proficiency
   - Voice-first preference
   - Limited legal awareness
   - Primary issues: Land disputes, government schemes, RTI applications

3. **First-time legal system users**
   - No prior legal consultation experience
   - Anxious about legal processes
   - Need hand-holding throughout the journey

### Secondary Users
1. **NGOs and Legal Aid Organizations**
   - Need to scale their impact
   - Limited resources per case
   - Want to focus on complex cases

2. **Pro-bono lawyers**
   - Want to help but overwhelmed by basic queries
   - Need pre-prepared cases for efficiency

## Functional Requirements

### FR1: Conversational Legal Navigator

**FR1.1 Natural Language Understanding**
- Support for 10+ Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia)
- Voice input with Indian accent recognition (90%+ accuracy)
- Text input with multilingual keyboard support
- Context-aware conversation that remembers user's case history

**FR1.2 Legal Issue Identification**
- Automatically categorize user's problem into legal domains:
  - Landlord-tenant disputes
  - Consumer complaints
  - Workplace harassment/labor issues
  - Police complaints (FIR)
  - RTI applications
  - Domestic violence
  - Property disputes
  - Cheque bounce cases
  - Traffic violations
  - Government scheme access
- Multi-turn conversation to gather all relevant details
- Confidence scoring for issue categorization (show 80%+ confidence to user)

**FR1.3 Guided Information Collection**
- Contextual questions based on issue type
- Plain language explanations for each question (no legal jargon)
- Skip logic based on user responses
- Option to save progress and continue later
- Validation of collected information

**FR1.4 Legal Rights Education**
- Explain relevant laws in simple language
- Provide examples and analogies from user's context
- Show what user is entitled to under the law
- Explain potential outcomes and timelines

### FR2: Smart Document Generation

**FR2.1 Document Types**
- Legal notices (landlord, neighbor, etc.)
- Consumer court complaints
- RTI (Right to Information) applications
- Police FIR templates
- Labour court petitions
- Affidavits
- Responses to legal notices
- Vakalatnama (Power of Attorney for lawyers)

**FR2.2 Document Features**
- Auto-fill from conversation data
- Dual-view: Legal language + plain language translation side-by-side
- Compliance with legal format requirements per jurisdiction
- Citations to relevant laws and sections
- Downloadable in multiple formats (PDF, DOCX)
- Court-ready formatting with proper stamps and signatures

**FR2.3 Evidence Checklist**
- Smart checklist of required documents based on case type
- Status tracking (collected ✓ / pending)
- Upload and organize evidence digitally
- Automatic redaction of sensitive information
- Tips for collecting additional evidence

**FR2.4 Document Review**
- AI review for completeness and errors
- Highlight missing information
- Suggest improvements
- Version history with change tracking

### FR3: Justice Copilot (WOW Feature)

**FR3.1 Context-Aware Intelligence**
- Maintain complete case history across sessions
- Learn from user's interactions and preferences
- Proactive notifications and reminders:
  - Notice period deadlines
  - Court hearing dates
  - Document submission deadlines
  - Response timeframes

**FR3.2 Evidence Intelligence**
- Analyze uploaded files (WhatsApp chats, emails, photos, PDFs)
- Identify and extract legally relevant content
- Suggest strongest evidence for the case
- Auto-organize chronologically
- Flag potential red flags or weak points

**FR3.3 Case Strength Assessment**
- Real-time confidence scoring (0-100)
- Breakdown by factors:
  - Documentary evidence strength
  - Legal precedent alignment
  - Jurisdiction-specific considerations
- Suggestions to improve case strength
- Comparison with similar cases

**FR3.4 Real-Time Legal Updates**
- Monitor relevant court judgments
- Track law amendments affecting user's case
- Automatically update documents if laws change
- Notify users of beneficial developments

### FR4: Court Process Roadmap

**FR4.1 Step-by-Step Guidance**
- Visual timeline of entire legal process
- Current status indicator
- Expected time for each step
- What happens at each stage
- What user needs to do/prepare

**FR4.2 Court Preparation**
- Mock questions and answers for hearings
- Dos and don'ts for court appearance
- Dress code and etiquette
- What to carry checklist

**FR4.3 Progress Tracking**
- Integration with eCourts API for case status
- SMS/WhatsApp notifications for updates
- Timeline visualization with milestones

### FR5: Pro-Bono Lawyer Marketplace

**FR5.1 Lawyer Discovery**
- Filter by location, specialization, language
- Ratings and reviews from previous users
- Success rate statistics
- Availability calendar

**FR5.2 Case Handoff**
- Share complete case file with lawyer
- Include AI-generated summary
- Highlight key evidence and arguments
- Lawyer can review before accepting case

**FR5.3 Consultation Modes**
- Text chat
- Voice/video calls
- In-person meeting scheduling
- Document sharing

**FR5.4 Pricing**
- Transparent fixed pricing
- Subsidized rates for low-income users
- Payment gateway integration
- Escrow for dispute resolution

### FR6: Multi-Channel Access

**FR6.1 Mobile Application**
- Native iOS and Android apps
- Offline mode for viewing documents
- Push notifications
- Biometric authentication

**FR6.2 Web Application**
- Responsive design (mobile, tablet, desktop)
- Progressive Web App (PWA)
- Printable document formats

**FR6.3 WhatsApp Bot**
- Complete journey via WhatsApp
- Voice message support
- Document sharing via WhatsApp
- Status updates
- Appointment scheduling

**FR6.4 SMS Interface**
- Basic queries via SMS for feature phones
- Status updates and reminders
- USSD code integration (optional)

### FR7: Data Management

**FR7.1 User Profile**
- Personal information
- Case history
- Document library
- Saved searches
- Preferences (language, notification settings)

**FR7.2 Data Security**
- End-to-end encryption for sensitive data
- Multi-factor authentication
- Role-based access control
- Audit logs for all actions

**FR7.3 Data Portability**
- Export all user data (GDPR compliance)
- Transfer case to another platform
- Share case file with external parties

**FR7.4 Privacy**
- Anonymization for case studies
- Opt-in for data usage in research
- Clear privacy policy in simple language
- Right to be forgotten

## Non-Functional Requirements

### NFR1: Performance

- **Response Time:**
  - Conversational AI response: < 2 seconds
  - Document generation: < 30 seconds
  - Evidence analysis: < 60 seconds
  - Search results: < 1 second

- **Scalability:**
  - Support 100,000 concurrent users
  - Handle 1 million cases in database
  - Auto-scaling based on load

- **Availability:**
  - 99.5% uptime (excluding scheduled maintenance)
  - Maximum planned downtime: 4 hours/month
  - Graceful degradation if external services fail

### NFR2: Usability

- **Accessibility:**
  - WCAG 2.1 Level AA compliance
  - Screen reader support
  - Voice navigation
  - High contrast mode
  - Font size adjustment

- **Learning Curve:**
  - First-time users should complete basic task in < 10 minutes
  - No training required for basic features
  - Contextual help available on every screen

- **Language Support:**
  - 10+ Indian languages with cultural localization
  - Regional variations (e.g., dialects)
  - Mixed language support (Hinglish)

### NFR3: Reliability

- **Accuracy:**
  - Legal information accuracy: > 95%
  - Document generation accuracy: > 90%
  - Speech recognition: > 90% for Indian accents
  - Case categorization: > 85%

- **Data Integrity:**
  - Zero data loss
  - Daily backups with 30-day retention
  - Point-in-time recovery

- **Error Handling:**
  - Graceful error messages in user's language
  - Automatic retry for transient failures
  - Fallback mechanisms

### NFR4: Security

- **Authentication:**
  - Phone number + OTP
  - Optional email verification
  - Biometric authentication on mobile

- **Data Protection:**
  - AES-256 encryption at rest
  - TLS 1.3 for data in transit
  - Secure key management (AWS KMS)

- **Compliance:**
  - GDPR compliance
  - IT Act 2000 compliance
  - Bar Council of India guidelines
  - Data localization (India)

### NFR5: Maintainability

- **Code Quality:**
  - 80%+ test coverage
  - Code review for all changes
  - Automated testing (unit, integration, E2E)

- **Documentation:**
  - API documentation (OpenAPI/Swagger)
  - Architecture diagrams
  - Deployment runbooks
  - User guides in all supported languages

- **Monitoring:**
  - Real-time performance metrics
  - Error tracking and alerting
  - User behavior analytics
  - A/B testing infrastructure

### NFR6: Cost Efficiency

- **Infrastructure:**
  - Serverless architecture where possible
  - Auto-scaling to match demand
  - Efficient caching strategies

- **AI Costs:**
  - Local models for simple tasks
  - Cloud LLMs only for complex reasoning
  - Batch processing where latency allows

## Integration Requirements

### INT1: External APIs

- **Government Services:**
  - eCourts API (case status tracking)
  - India Post API (registered post for notices)
  - Aadhaar API (optional verification)

- **Communication:**
  - Twilio (SMS, WhatsApp)
  - AWS SNS (push notifications)
  - SendGrid (email)

- **Payment:**
  - Razorpay or Stripe
  - UPI integration
  - Wallet support

- **Maps and Location:**
  - Google Maps API (court locations, lawyer offices)
  - Geolocation services

### INT2: AI/ML Services

- **LLM APIs:**
  - OpenAI GPT-4 / Anthropic Claude
  - Fallback to open-source models

- **Speech Services:**
  - Google Cloud Speech-to-Text (Indian languages)
  - Azure Cognitive Services (backup)

- **Translation:**
  - Google Translate API
  - Custom NMT models for legal terminology

## Success Metrics

### User Metrics
- **Acquisition:** 10,000 users in first 3 months
- **Activation:** 70% complete at least one legal task
- **Retention:** 40% return within 30 days
- **Referral:** NPS score > 50

### Impact Metrics
- **Cases Filed:** 1,000 cases filed successfully in first 6 months
- **Cost Savings:** Average ₹4,500 saved per user
- **Time Savings:** Average 2.5 weeks saved per user
- **Success Rate:** 75% of cases result in favorable outcome

### Technical Metrics
- **Accuracy:** > 90% document accuracy (audited by lawyers)
- **Performance:** < 2s average response time
- **Uptime:** > 99.5% availability
- **Satisfaction:** 4.5+ star rating on app stores

### Business Metrics
- **Revenue:** ₹10 lakh ARR by end of Year 1
- **Unit Economics:** LTV:CAC ratio > 3:1
- **Partnerships:** 10 NGO partnerships in first year
- **Press:** 5 media features in first 6 months

## Constraints and Assumptions

### Constraints
1. Legal AI cannot replace lawyers for court representation
2. Cannot provide definitive legal advice (must include disclaimers)
3. Limited to civil law initially (no criminal law beyond FIRs)
4. Requires internet connectivity (offline mode limited)
5. Must comply with Bar Council regulations on legal advertising

### Assumptions
1. Users have basic smartphone (Android 8.0+, iOS 12+)
2. Users have mobile data connection (3G minimum)
3. Users can provide basic case details accurately
4. Pro-bono lawyers willing to join marketplace
5. NGOs willing to promote and provide feedback

## Out of Scope (Phase 1)

The following features are explicitly out of scope for the MVP:

1. Criminal law cases (except basic FIR filing)
2. Divorce and family court matters (requires sensitive handling)
3. Corporate/commercial litigation
4. Intellectual property disputes
5. Video evidence analysis (complex ML)
6. Automatic court filing (eFiling integration)
7. AI court hearing support (needs regulatory approval)
8. Payment to government (stamps, court fees)

## Risks and Mitigations

### Risk 1: Legal Accuracy
- **Risk:** AI provides incorrect legal information
- **Mitigation:** 
  - RAG system with verified legal database
  - Regular audits by qualified lawyers
  - Clear disclaimers
  - Lawyer review before critical actions

### Risk 2: User Trust
- **Risk:** Users don't trust AI for legal matters
- **Mitigation:**
  - Transparent about AI limitations
  - Show sources and legal citations
  - Case studies and testimonials
  - NGO partnerships for credibility

### Risk 3: Regulatory Compliance
- **Risk:** Bar Council restrictions on legal tech
- **Mitigation:**
  - Position as "legal education and document preparation" not "legal advice"
  - Consult with legal tech compliance experts
  - Always route final decisions through lawyers
  - Clear terms of service

### Risk 4: Scalability
- **Risk:** Cannot handle viral growth
- **Mitigation:**
  - Serverless architecture
  - Auto-scaling infrastructure
  - Waitlist mechanism
  - Gradual rollout by geography

### Risk 5: Misuse
- **Risk:** Users provide false information or misuse platform
- **Mitigation:**
  - Identity verification
  - Audit trails
  - Rate limiting
  - Report abuse mechanism
  - Terms of service enforcement

## Appendix A: Legal Issue Coverage (Phase 1)

| Issue Category | Sub-Issues | Priority |
|---------------|-----------|----------|
| Landlord-Tenant | Security deposit, eviction, rent increase, repairs | High |
| Consumer Complaints | Defective products, service deficiency, refund | High |
| RTI Applications | Information requests, appeals | High |
| Workplace | Salary disputes, wrongful termination, harassment | Medium |
| Police | FIR filing, complaint against police | Medium |
| Traffic | Challans, license issues | Low |

## Appendix B: Jurisdictional Coverage

**Phase 1 (MVP):**
- Maharashtra
- Karnataka
- Delhi NCR

**Phase 2 (6 months):**
- Tamil Nadu
- West Bengal
- Uttar Pradesh
- Gujarat

**Phase 3 (12 months):**
- All Indian states and Union Territories

## Appendix C: Document Templates

Minimum templates required for MVP:

1. Legal Notice - Landlord (Security Deposit)
2. Legal Notice - Consumer Complaint
3. Consumer Court Complaint Format
4. RTI Application Format
5. Police Complaint / FIR Format
6. Response to Legal Notice
7. Affidavit Template
8. Vakalatnama (Power of Attorney)

Each template must have:
- English version
- Hindi version
- State-specific variations where applicable
- Citations to relevant laws
