# PrescriptoAI

> **Turn prescriptions into clear notes in seconds.**

PrescriptoAI is a mobile-first web application that converts doctor's prescriptions (photo/scan/PDF) into plain-language, structured medication notes that are easy to read, verify, download, and share.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to the app directory
cd app-build

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with the following:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Mock Mode (set to "true" for development without API calls)
MOCK_MODE=true

# OCR Provider (for future implementation)
OCR_PROVIDER=mock

# Data Retention (hours)
DATA_RETENTION_HOURS=24
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ocr/route.ts           # OCR processing endpoint
│   │   ├── extract/route.ts       # Gemini extraction endpoint
│   │   ├── generate-notes/route.ts # Notes generation endpoint
│   │   ├── export/pdf/route.ts    # PDF export endpoint
│   │   └── feedback/route.ts      # User feedback endpoint
│   ├── page.tsx                   # Home page
│   ├── upload/page.tsx            # Upload page
│   ├── review/page.tsx            # Review & Fix page
│   ├── notes/page.tsx             # Results page
│   ├── privacy/page.tsx           # Privacy Policy
│   ├── terms/page.tsx             # Terms + Medical Disclaimer
│   ├── not-found.tsx              # 404 page
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
│
├── components/
│   ├── UploadDropzone.tsx         # File upload component
│   ├── MedicationCard.tsx         # Medication display/edit card
│   ├── ScheduleTable.tsx          # Daily schedule table
│   ├── ConfidenceChip.tsx         # Confidence indicator
│   └── DisclaimerBanner.tsx       # Medical disclaimer
│
└── lib/
    ├── schema.ts                  # Zod schemas + TypeScript types
    ├── abbreviations.ts           # Medical abbreviation expansions
    ├── gemini.ts                  # Gemini API wrapper
    ├── ocr.ts                     # OCR processing wrapper
    ├── pdf.ts                     # PDF generation utilities
    ├── mock-data.ts               # Mock data for development
    └── storage.ts                 # Session storage utilities
```

## 🛠 Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **AI:** Google Gemini API
- **PDF Generation:** jsPDF
- **Icons:** Lucide React

## ✨ Features

### MVP Features
- ✅ Upload prescription images (JPG, PNG, WebP, PDF)
- ✅ Camera capture on mobile devices
- ✅ OCR text extraction (mock mode)
- ✅ AI-powered medication extraction (Gemini)
- ✅ Confidence scoring for extracted fields
- ✅ Editable OCR text (collapsible)
- ✅ Field-level medication editing
- ✅ Daily medication schedule (Morning/Afternoon/Night)
- ✅ PDF download
- ✅ Print view
- ✅ User feedback collection
- ✅ Privacy-first design (24h retention, delete now)
- ✅ Medical disclaimers throughout

### Abbreviation Support
Expands common prescription abbreviations:
- **Frequency:** OD, BD, TDS, QID, HS, SOS, PRN
- **Timing:** AC, PC, MANE, NOCTE
- **Route:** PO, SL, IM, IV, TOP
- **Form:** TAB, CAP, SYR, INJ

## 🔧 Mock Mode

Set `MOCK_MODE=true` in `.env.local` to run without API calls. The app will use sample prescription data for testing.

## 📋 TODO: Production Readiness

### OCR Integration
- [ ] Integrate Google Cloud Vision API
- [ ] Or integrate Azure Cognitive Services
- [ ] Or integrate AWS Textract
- [ ] Add Tesseract.js for client-side fallback

### Storage
- [ ] Add PostgreSQL/MongoDB for data persistence
- [ ] Implement proper file storage (S3, GCS)
- [ ] Add signed URLs for secure file access

### Security
- [ ] Add rate limiting
- [ ] Implement CSRF protection
- [ ] Add input sanitization
- [ ] Security audit

### Analytics
- [ ] Privacy-safe analytics
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

### Features
- [ ] Multi-language output
- [ ] User accounts (opt-in)
- [ ] Pharmacist verification workflow
- [ ] Reminder integrations

## ⚠️ Important Disclaimer

PrescriptoAI is an **information assistant**, not medical advice. Users should:
- Always verify medications with their doctor or pharmacist
- Not make medical decisions based solely on this service
- Seek immediate medical attention for emergencies

## 📄 License

This project is proprietary. All rights reserved.

---

Built with ❤️ using Next.js, Tailwind CSS, and Google Gemini
