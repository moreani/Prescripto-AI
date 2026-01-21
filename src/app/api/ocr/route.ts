import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMockOCRResult } from '@/lib/mock-data';
import { OCRResult } from '@/lib/schema';
import { validateOCRInput } from '@/lib/ocr';

/**
 * Use Gemini Vision to extract text from an image
 */
async function extractTextWithGeminiVision(
    base64Data: string,
    mimeType: string
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };

    const prompt = `You are an expert medical prescription OCR system trained to read HANDWRITTEN doctor prescriptions.

CRITICAL: This is likely a HANDWRITTEN prescription. Doctors often have difficult handwriting. Be very careful and thorough.

Extract ALL visible text from this prescription image. Pay special attention to:

1. **Header Information**:
   - Hospital/Clinic name (may be in regional language + English)
   - Doctor name, qualifications, registration number
   - Contact information

2. **Patient Details**:
   - Patient name, age, sex, date
   - Address if visible

3. **Medications** (most important - look very carefully):
   - Look for numbered items (1, 2, 3...) or circled numbers
   - Each medication line typically has: drug name, dosage, frequency
   - Common abbreviations to recognize:
     * T. or Tab = Tablet
     * C. or Cap = Capsule
     * Inj = Injection
     * Syr = Syrup
     * OD = Once daily
     * BD = Twice daily
     * TDS/TID = Three times daily
     * QID = Four times daily
     * HS = At bedtime
     * SOS/PRN = As needed
     * AC = Before meals
     * PC = After meals
   - Numbers in circles often indicate quantity (e.g., ⑩ = 10 tablets)

4. **Instructions**:
   - H/o = History of
   - c/o = Complaining of
   - Rx = Prescription
   - Advice, follow-up dates

5. **Footer**:
   - Pharmacy details if any
   - Any stamps or signatures

Return the extracted text in a STRUCTURED format:
---
HOSPITAL: [name]
DOCTOR: [name and qualifications]
PATIENT: [name], Age: [age], Sex: [M/F], Date: [date]

DIAGNOSIS/HISTORY:
[any diagnosis or history notes]

MEDICATIONS:
1. [Drug name] [Strength] - [Dose] [Frequency] - [Quantity/Duration]
2. [Continue for all medications...]

ADVICE:
[any additional instructions]
---

If any text is unclear, make your best educated guess based on medical context, but indicate uncertainty with [?].`;

    const result = await geminiModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text();
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const base64Data = formData.get('base64') as string | null;
        const mimeType = formData.get('mimeType') as string | null;

        // Validate input
        if (!file && !base64Data) {
            return NextResponse.json(
                { error: 'No file provided. Please upload an image or PDF.' },
                { status: 400 }
            );
        }

        const actualMimeType = file?.type || mimeType || 'image/jpeg';

        if (!validateOCRInput(actualMimeType)) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload JPG, PNG, WebP, or PDF.' },
                { status: 400 }
            );
        }

        const prescriptionId = uuidv4();
        const isMockMode = process.env.MOCK_MODE === 'true';

        if (isMockMode) {
            console.log('[API/OCR] Mock mode enabled, returning mock data');

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const result: OCRResult = getMockOCRResult(prescriptionId);

            return NextResponse.json(result);
        }

        // Real mode: Use Gemini Vision for OCR
        console.log('[API/OCR] Using Gemini Vision for OCR');

        let imageBase64: string;

        if (base64Data) {
            // Already have base64 data
            imageBase64 = base64Data;
        } else if (file) {
            // Convert file to base64
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            imageBase64 = buffer.toString('base64');
        } else {
            return NextResponse.json(
                { error: 'No file data provided.' },
                { status: 400 }
            );
        }

        // Extract text using Gemini Vision
        const extractedText = await extractTextWithGeminiVision(imageBase64, actualMimeType);

        const result: OCRResult = {
            prescription_id: prescriptionId,
            ocr_text: extractedText,
            source_type: actualMimeType === 'application/pdf' ? 'pdf' : 'image',
            pages_count: 1,
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('[API/OCR] Error:', error);

        // Extract error message
        let errorMessage = 'Failed to process file. Please try again.';

        if (error instanceof Error) {
            console.error('[API/OCR] Error details:', error.message);

            if (error.message.includes('GEMINI_API_KEY')) {
                errorMessage = 'API key not configured. Please set GEMINI_API_KEY in environment.';
            } else if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid API key')) {
                errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY.';
            } else if (error.message.includes('SAFETY')) {
                errorMessage = 'Content was blocked by safety filters. Please try a different image.';
            } else if (error.message.includes('quota') || error.message.includes('RATE_LIMIT')) {
                errorMessage = 'API rate limit exceeded. Please try again in a moment.';
            } else if (error.message.includes('model')) {
                errorMessage = 'Model configuration error: ' + error.message;
            } else {
                // Return actual error for debugging
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
