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

    const prompt = `You are an expert medical prescription OCR specialist. Your task is to PERFECTLY transcribe ALL text from this prescription image.

CRITICAL RULES:
1. This is a HANDWRITTEN prescription with DIFFICULT doctor handwriting - you MUST try VERY hard to read it
2. DO NOT leave any field empty - always transcribe what you see, even if you need to guess
3. If unsure about a word, provide your BEST GUESS based on medical context and mark with [?]
4. NEVER say "None visible" or "Not legible" - always attempt to read the text

COMMON MEDICAL ABBREVIATIONS (memorize these):
- c/o = Complaining of
- H/o = History of  
- Adv / Adv: = Advice/Recommendations
- Imp / Imp: = Impression/Diagnosis
- Rx = Prescription
- BP = Blood Pressure
- PR = Pulse Rate
- RBS = Random Blood Sugar
- IV = Intravenous
- stat = immediately
- OD = Once daily, BD = Twice daily, TDS = Three times daily
- Tab/T. = Tablet, Cap/C. = Capsule, Inj = Injection, Syr = Syrup
- ORS = Oral Rehydration Salts
- ml = milliliters, mg = milligrams, % = percent

INDIAN PRESCRIPTION SPECIFIC:
- Often has printed hospital header at top
- Handwritten content below in a mix of English and medical terms
- May have regional language (Kannada, Hindi, Tamil etc.) - transliterate if possible
- Circled numbers indicate quantity
- Arrows (→) often indicate instructions

EXTRACTION FORMAT - Fill EVERY field:
---
DATE: [date from prescription]
HOSPITAL: [full hospital/clinic name from header]
DOCTOR: [doctor name, qualifications, registration if visible]
PATIENT: [name], Age: [age], Sex: [M/F]
ID/UHID: [any ID number visible]

CHIEF COMPLAINTS (c/o):
[what patient is complaining of - read carefully]

VITAL SIGNS:
- BP: [blood pressure if visible]
- PR/Pulse: [pulse rate if visible]
- RBS: [blood sugar if visible]
- Other: [any other vitals]

DIAGNOSIS/IMPRESSION (Imp):
[diagnosis or impression - this is crucial]

MEDICATIONS/TREATMENT (Rx or Adv):
1. [First medication/treatment - include dosage, route (oral/IV), frequency]
2. [Second medication/treatment]
3. [Continue for ALL items...]

ADDITIONAL ADVICE:
[any other instructions like diet, rest, follow-up]

SIGNATURE:
[doctor signature or registration number at bottom]
---

IMPORTANT: Look at EVERY part of the image. Do not skip anything. Even scribbles may contain important information.`;

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
