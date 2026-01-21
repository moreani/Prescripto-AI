# PrescriptoAI Handover & Project Status

## Project Overview
PrescriptoAI is a Next.js application that uses the Gemini API to extract and simplify medication information from prescription images.

## Current Infrastructure
- **Framework**: Next.js (App Router), TypeScript, Tailwind CSS.
- **AI**: Google Gemini API (`gemini-1.5-flash`).
- **Deployment**: Live on Vercel at [https://app-build-kappa.vercel.app](https://app-build-kappa.vercel.app).
- **Environment Variables**:
  - `GEMINI_API_KEY`: Configured on Vercel.
  - `MOCK_MODE`: Set to `false` for production extraction.
  - `GEMINI_MODEL`: `gemini-1.5-flash`.

## What's Working ✅
1.  **UI/UX**: Full landing page, upload zone, medication cards, and schedule table.
2.  **Theme Toggle**: Dark/Light mode toggle added to the header. Persists to `localStorage` and uses `@custom-variant dark (.dark &)` in `globals.css`.
3.  **Deployment**: Automated deployment to Vercel is set up.
4.  **Gemini Library**: `src/lib/gemini.ts` contains logic for both text-based extraction and direct image-to-JSON extraction using Gemini Vision.

## Current Issue / Next Task 🛠️
The user is seeing the error: **"Real OCR not implemented. Set MOCK_MODE=true in environment."**

### Root Cause:
The `src/lib/ocr.ts` file still has placeholder logic that throws an error when `MOCK_MODE=false`.
```typescript
// src/lib/ocr.ts
export async function processOCR(input: OCRInput): Promise<OCRResult> {
    // ...
    throw new Error('Real OCR not implemented yet. Set MOCK_MODE=true in .env.local');
}
```

### Plan for Next AI:
1.  **Implement OCR in `src/lib/ocr.ts`**: Instead of throwing an error, it should use Gemini to perform the OCR or, better yet, the extraction flow should be updated to skip the separate OCR step and use `extractPrescriptionFromImage` from `src/lib/gemini.ts` directly.
2.  **Verify the API Route**: Check `src/app/api/extract/route.ts` to see how it's calling the OCR and Gemini services. It should be wired to use the vision capabilities when an image is uploaded.
3.  **Redeploy**: Run `npx vercel --prod` after fixing the logic.

## Files of Interest:
- `src/lib/ocr.ts`: Contains the throwing error.
- `src/lib/gemini.ts`: Contains the `extractPrescriptionFromImage` function.
- `src/app/api/extract/route.ts`: The API endpoint handling the prescription upload.
- `src/app/layout.tsx` & `src/components/ThemeToggle.tsx`: Recent dark mode changes.
