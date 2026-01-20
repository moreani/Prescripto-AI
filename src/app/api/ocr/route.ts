import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getMockOCRResult, MOCK_OCR_TEXT } from '@/lib/mock-data';
import { OCRResult } from '@/lib/schema';
import { validateOCRInput } from '@/lib/ocr';

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

        // TODO: Implement real OCR integration
        // Options:
        // 1. Google Cloud Vision API
        // 2. Azure Cognitive Services
        // 3. AWS Textract
        // 4. Tesseract.js (client-side option)

        // For now, throw an error in non-mock mode
        return NextResponse.json(
            { error: 'Real OCR not implemented. Set MOCK_MODE=true in environment.' },
            { status: 501 }
        );

    } catch (error) {
        console.error('[API/OCR] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process file. Please try again.' },
            { status: 500 }
        );
    }
}
