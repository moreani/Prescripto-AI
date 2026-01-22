import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateOCRInput } from '@/lib/ocr';
import { preprocessPrescriptionImage } from '@/lib/image-preprocess';

/**
 * RAW OCR Endpoint for QA/Testing purposes
 * 
 * This endpoint performs EXACT transcription without any interpretation:
 * - Does NOT expand abbreviations
 * - Does NOT normalize units
 * - Does NOT correct doses
 * - Marks unclear text as [UNCLEAR]
 * - Does NOT invent or assume information
 */

async function extractRawTextWithGeminiVision(
    base64Data: string,
    mimeType: string
): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-pro';

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
        model,
        generationConfig: {
            temperature: 0,      // Deterministic output - no creativity
            topP: 0.8,           // Focus on high-probability tokens
            maxOutputTokens: 8192,
        },
    });

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };

    // QA/Testing prompt - EXACT transcription only, clean output
    const prompt = `You are a medical document transcriber for QA testing. Your ONLY job is to transcribe exactly what you see.

RULES:
- Do NOT expand abbreviations (BD stays BD, OD stays OD)
- Do NOT normalize units (500mg stays 500mg)
- Do NOT correct spelling or doses
- Do NOT interpret or explain anything
- Do NOT include these instructions in your output
- Mark illegible text as [UNCLEAR]
- Mark partially readable as [PARTIAL: visible text]

OUTPUT FORMAT - Just transcribe the prescription content:

HEADER:
[Hospital/clinic name, doctor info as written]

PATIENT INFO:
[Name, age, date etc as written]

VITALS:
[BP, pulse etc if visible]

COMPLAINTS:
[Chief complaints as written]

DIAGNOSIS:
[Diagnosis as written]

MEDICATIONS (exactly as written):
1. [Drug name] [strength] [form] [frequency] [duration]
2. [Next medication...]

ADVICE/INSTRUCTIONS:
[Any advice written]

FOLLOW UP:
[Follow up date if written]

SIGNATURES/STAMPS:
[Describe any signatures or stamps]

UNCLEAR ITEMS:
[List items that were hard to read]

Now transcribe this prescription:`;

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

        console.log('[API/OCR/RAW] Using Gemini Vision for RAW transcription (QA mode)');

        let imageBase64: string;
        let processedMimeType: string = actualMimeType;

        if (base64Data) {
            const rawBuffer = Buffer.from(base64Data, 'base64');
            console.log('[API/OCR/RAW] Preprocessing uploaded image...');
            const processed = await preprocessPrescriptionImage(rawBuffer, actualMimeType);
            imageBase64 = processed.base64;
            processedMimeType = processed.mimeType;
        } else if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const rawBuffer = Buffer.from(arrayBuffer);
            console.log('[API/OCR/RAW] Preprocessing uploaded file...');
            const processed = await preprocessPrescriptionImage(rawBuffer, actualMimeType);
            imageBase64 = processed.base64;
            processedMimeType = processed.mimeType;
        } else {
            return NextResponse.json(
                { error: 'No file data provided.' },
                { status: 400 }
            );
        }

        // Extract raw text using Gemini Vision with QA prompt
        const rawText = await extractRawTextWithGeminiVision(imageBase64, processedMimeType);

        return NextResponse.json({
            prescription_id: prescriptionId,
            raw_transcription: rawText,
            source_type: actualMimeType === 'application/pdf' ? 'pdf' : 'image',
            mode: 'qa_raw',
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('[API/OCR/RAW] Error:', error);

        let errorMessage = 'Failed to process file. Please try again.';

        if (error instanceof Error) {
            console.error('[API/OCR/RAW] Error details:', error.message);

            if (error.message.includes('GEMINI_API_KEY')) {
                errorMessage = 'API key not configured. Please set GEMINI_API_KEY in environment.';
            } else if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid API key')) {
                errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY.';
            } else if (error.message.includes('SAFETY')) {
                errorMessage = 'Content was blocked by safety filters. Please try a different image.';
            } else if (error.message.includes('quota') || error.message.includes('RATE_LIMIT')) {
                errorMessage = 'API rate limit exceeded. Please try again in a moment.';
            } else {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
