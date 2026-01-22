# PrescriptoAI - Complete Project Documentation

> **Last Updated:** January 22, 2026  
> **Status:** ✅ Fully Functional  
> **Deployment:** Live on Vercel at [https://app-build-kappa.vercel.app](https://app-build-kappa.vercel.app)

---

## 📋 Project Overview

**PrescriptoAI** is a Next.js application that uses Google Gemini AI to extract and simplify medication information from prescription images. Users upload a prescription photo, the AI extracts all medications with dosages/frequencies, and generates easy-to-read notes that can be downloaded as PDF or emailed.

### Key Features
- 📷 Upload prescription images (JPG, PNG, WebP, PDF)
- 🤖 AI-powered OCR and data extraction via Gemini Vision
- 💊 Medication parsing with abbreviation expansion (OD → Once daily)
- 📅 Auto-generated medication schedule (morning/afternoon/night)
- 📄 PDF generation and download
- 📧 Email delivery of prescription notes
- 🌙 Dark/Light mode toggle
- 🔒 Privacy-first design (auto-delete after 24 hours)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14+ (App Router) with TypeScript |
| **Styling** | Tailwind CSS with dark/light mode |
| **AI Model** | Google Gemini (`gemini-2.0-pro`) |
| **PDF** | jsPDF |
| **Email** | Resend API |
| **Deployment** | Vercel |
| **Validation** | Zod schemas |

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key |
| `GEMINI_MODEL` | No | Model name (default: `gemini-2.0-pro`) |
| `MOCK_MODE` | No | `true` = use mock data, `false` = real API |
| `TEST_MODE` | No | `true` = download PDF directly instead of email |
| `QA_MODE` | No | `true` = raw transcription PDF for accuracy testing (see below) |
| `RESEND_API_KEY` | For email | Resend API key for email delivery |

### QA Mode (`QA_MODE=true`)

When enabled, the app generates a **raw transcription PDF** for testing/QA purposes:
- ❌ Does NOT expand abbreviations (keeps "BD" as "BD")
- ❌ Does NOT normalize units
- ❌ Does NOT correct doses or fix errors
- ✅ Transcribes EXACTLY what is visible
- ✅ Marks illegible text as `[UNCLEAR]`
- ✅ Shows confidence notes for difficult readings

**Use case:** Verify OCR accuracy by comparing raw output against original prescription.

---

## 📁 Project Structure

```
app-build/
├── src/
│   ├── app/                      # Next.js App Router pages & API
│   │   ├── api/                  # Backend API endpoints
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── layout.tsx            # Root layout with theme support
│   │   ├── globals.css           # Global styles + dark mode
│   │   ├── upload/page.tsx       # Upload prescription (/upload)
│   │   ├── review/page.tsx       # Review extracted data (/review)
│   │   ├── notes/page.tsx        # View generated notes (/notes)
│   │   ├── success/page.tsx      # Success confirmation (/success)
│   │   ├── privacy/page.tsx      # Privacy policy (/privacy)
│   │   ├── terms/page.tsx        # Terms of service (/terms)
│   │   └── not-found.tsx         # 404 page
│   ├── components/               # Reusable UI components
│   └── lib/                      # Utility libraries
├── public/                       # Static assets
├── package.json
└── tsconfig.json
```

---

## 📡 API Endpoints

### `POST /api/ocr`
**Purpose:** Extract text from prescription image using Gemini Vision  
**Input:** FormData with `file` (File) or `base64` + `mimeType`  
**Output:** `{ prescription_id, ocr_text, source_type, pages_count }`  
**Key Features:**
- Uses sophisticated "Transcribe-Then-Interpret" prompt
- Includes extensive medical abbreviation dictionary
- Image preprocessing for better OCR accuracy
- Handles Indian prescription formats

### `POST /api/ocr/raw` ⚠️ QA Mode
**Purpose:** Raw OCR transcription for accuracy testing  
**Input:** FormData with `file` (File) or `base64` + `mimeType`  
**Output:** `{ prescription_id, raw_transcription, source_type, mode: "qa_raw", timestamp }`  
**Key Features:**
- EXACT transcription without any interpretation
- Does NOT expand abbreviations
- Does NOT normalize units or correct doses
- Marks illegible text as `[UNCLEAR]`
- Used only when `QA_MODE=true`

### `POST /api/extract`
**Purpose:** Extract structured medication data from image or OCR text  
**Input:** `{ prescription_id, ocr_text?, image_base64?, mime_type? }`  
**Output:** Full `PrescriptionExtract` with patient_info, medications, vitals, diagnosis, etc.  
**Routes to:**
- `extractPrescriptionFromImage()` if image_base64 provided
- `extractPrescriptionWithGemini()` if only ocr_text provided

### `POST /api/generate-notes`
**Purpose:** Generate readable notes and schedule from medications  
**Input:** `{ prescription_id, medications, follow_up?, tests?, patient_info?, vitals?, diagnosis?, advice? }`  
**Output:** `NotesOutput` with `notes_markdown`, `schedule`, `meds_display`

### `POST /api/send-email`
**Purpose:** Send prescription PDF via email  
**Input:** `{ email, prescription_id, notes }`  
**Output:** `{ success: boolean, error?: string }`

### `POST /api/export/pdf`
**Purpose:** Generate and return patient-readable PDF as base64  
**Input:** `NotesOutput`  
**Output:** `{ pdf_base64: string, filename: string }`

### `POST /api/export/qa-pdf` ⚠️ QA Mode
**Purpose:** Generate raw transcription PDF for accuracy testing  
**Input:** `{ prescription_id, raw_transcription, source_type, timestamp }`  
**Output:** `{ pdf_base64: string, filename: string, mode: "qa" }`  
**Key Features:**
- Red "QA/TESTING MODE" header on every page
- Shows raw transcription without processing
- Highlights `[UNCLEAR]` markers in red
- Includes confidence notes
- Clear "NOT FOR PATIENT USE" warnings

### `POST /api/feedback`
**Purpose:** Collect user feedback on extraction accuracy  

### `GET /api/config`
**Purpose:** Return client-safe configuration (test mode status, etc.)

---

## 🧩 Components

| Component | File | Purpose |
|-----------|------|---------|
| **UploadDropzone** | `components/UploadDropzone.tsx` | Drag-drop file upload with camera support |
| **MedicationCard** | `components/MedicationCard.tsx` | Display medication with details, confidence indicators |
| **ScheduleTable** | `components/ScheduleTable.tsx` | Show medication timing (morning/afternoon/night) |
| **EmailModal** | `components/EmailModal.tsx` | Modal for entering email to receive PDF |
| **ConfidenceChip** | `components/ConfidenceChip.tsx` | Visual confidence indicator (green/yellow/red) |
| **DisclaimerBanner** | `components/DisclaimerBanner.tsx` | Medical disclaimer component |
| **ThemeToggle** | `components/ThemeToggle.tsx` | Dark/light mode switcher |

---

## 📚 Library Files

### `lib/gemini.ts`
**Core AI integration with Gemini API**
- `extractPrescriptionWithGemini(ocrText, prescriptionId)` - Extract from OCR text
- `extractPrescriptionFromImage(imageBase64, mimeType, prescriptionId)` - Direct image extraction
- Contains 90-line EXTRACTION_PROMPT with schema for medications, patient info, vitals, etc.

### `lib/ocr.ts`
**OCR utilities (used only for validation/mock mode)**
- `processOCR()` - Mock mode OCR processor
- `validateOCRInput(mimeType)` - Validate file types
- `getFileTypeLabel(mimeType)` - Get display labels
- ⚠️ Note: Real OCR is in `/api/ocr/route.ts`, not this file

### `lib/pdf.ts`
**PDF generation with jsPDF**
- `generatePDF(notes, options)` - Generate PDF document
- `generatePDFBase64(notes)` - Return PDF as base64
- `generatePDFBlob(notes)` - Return PDF as Blob
- `downloadPDF(notes, filename)` - Trigger browser download
- Includes patient info, medications, schedule, disclaimers

### `lib/email.ts`
**Email sending via Resend**
- `sendEmail({ to, subject, html, attachments })` - Send email
- `generatePrescriptionEmailHTML(prescriptionId)` - HTML email template

### `lib/schema.ts`
**Zod schemas for type validation**
- `MedicationSchema` - Medication object validation
- `PrescriptionExtractSchema` - Full extraction result
- `NotesOutputSchema` - Generated notes format
- `OCRResultSchema` - OCR response format

### `lib/image-preprocess.ts`
**Image enhancement for better OCR**
- `preprocessPrescriptionImage(buffer, mimeType)` - Enhance image
- Uses sharp for contrast, sharpening, resize

### `lib/abbreviations.ts`
**Medical abbreviation expansion**
- `formatFrequency(freq)` - Expand "BD" → "Twice daily"
- `expandAbbreviation(abbr)` - Expand medical terms
- `getTimingFromFrequency(freq)` - Map to morning/afternoon/night

### `lib/mock-data.ts`
**Mock data for testing**
- `getMockOCRResult(prescriptionId)` - Sample OCR output
- `getMockPrescriptionExtract(prescriptionId)` - Sample extraction
- `getMockNotesOutput(prescriptionId)` - Sample notes
- `MOCK_OCR_TEXT` - Sample prescription text

### `lib/storage.ts`
**Client-side storage utilities**
- `saveToSession(key, data)` - Save to sessionStorage
- `getFromSession(key)` - Retrieve from sessionStorage
- Used to pass data between pages

---

## 🔄 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   /upload   │────▶│  /api/ocr   │────▶│  /api/extract   │
│   (page)    │     │  (Gemini    │     │  (Structure     │
│             │     │   Vision)   │     │   JSON data)    │
└─────────────┘     └─────────────┘     └────────┬────────┘
                                                 │
                                                 ▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   /notes    │◀────│ /api/generate-  │◀────│   /review   │
│   (view)    │     │     notes       │     │   (edit)    │
└──────┬──────┘     └─────────────────┘     └─────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  /api/send-email  OR  /api/export   │
│  (Email PDF)      OR  (Download)    │
└─────────────────────────────────────┘
```

---

## 📝 Key Data Structures

### Medication Object
```typescript
{
  name: string;           // "Paracetamol"
  strength: string | null; // "500mg"
  form: string | null;     // "Tablet"
  route: string | null;    // "Oral"
  dose: string | null;     // "1 tablet"
  frequency: string | null; // "BD" or "Twice daily"
  timing: string[];        // ["morning", "night"]
  duration_days: number | null; // 7
  food_instruction: string | null; // "After food"
  instructions: string[];  // ["Take with water"]
  confidence: { name: number; dose: number }; // 0.0-1.0
  needs_confirmation: string[]; // ["dose", "frequency"]
}
```

### NotesOutput Object
```typescript
{
  prescription_id: string;
  notes_markdown: string;  // Readable markdown notes
  schedule: {
    morning: ScheduleItem[];
    afternoon: ScheduleItem[];
    evening: ScheduleItem[];
    night: ScheduleItem[];
    as_needed: ScheduleItem[];
  };
  meds_display: Medication[];
  patient_info?: { name, age, sex, uhid };
  doctor_info?: { name, qualifications, hospital };
  vitals?: { bp, pulse, rbs, fbs, ppbs, spo2, temperature };
  diagnosis?: string;
  complaints?: string[];
  advice?: string[];
}
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Create .env.local with:
GEMINI_API_KEY=your_key_here
MOCK_MODE=false
TEST_MODE=true  # For direct PDF download
# RESEND_API_KEY=your_resend_key  # Optional for email

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 🔧 Common Tasks

### Add a new medication field
1. Update `MedicationSchema` in `lib/schema.ts`
2. Update extraction prompt in `lib/gemini.ts`
3. Update `MedicationCard.tsx` to display the field
4. Update `lib/pdf.ts` to include in PDF

### Modify OCR prompt
Edit the `prompt` constant in `src/app/api/ocr/route.ts` (lines 40-249)

### Add new abbreviation
Edit `ABBREVIATION_MAP` in `lib/abbreviations.ts`

### Change PDF styling
Edit `generatePDF()` function in `lib/pdf.ts`

---

## ✅ Production Checklist

- [x] Gemini Vision OCR implemented
- [x] Structured extraction with JSON schema
- [x] Medical abbreviation expansion
- [x] Image preprocessing for better OCR
- [x] PDF generation
- [x] Email delivery (Resend)
- [x] Dark/Light mode
- [x] Mobile responsive
- [x] Error handling
- [x] Test mode (direct PDF download)
- [x] Vercel deployment
- [x] **Anti-hallucination safeguards** - AI explicitly instructed to NEVER fabricate diagnosis/vitals/complaints

---

## 📞 Support

For issues or feature requests, check the codebase first using this document as a reference, then explore specific files as needed.
