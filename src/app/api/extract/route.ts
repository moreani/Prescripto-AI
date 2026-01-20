import { NextRequest, NextResponse } from 'next/server';
import { extractPrescriptionWithGemini, extractPrescriptionFromImage } from '@/lib/gemini';
import { PrescriptionExtractSchema } from '@/lib/schema';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prescription_id, ocr_text, image_base64, mime_type, locale = 'en' } = body;

        // Validate input
        if (!prescription_id) {
            return NextResponse.json(
                { error: 'prescription_id is required' },
                { status: 400 }
            );
        }

        if (!ocr_text && !image_base64) {
            return NextResponse.json(
                { error: 'Either ocr_text or image_base64 is required' },
                { status: 400 }
            );
        }

        let result;

        // If we have image data, process directly with Gemini vision
        if (image_base64 && mime_type) {
            result = await extractPrescriptionFromImage(
                image_base64,
                mime_type,
                prescription_id
            );
        } else {
            // Use OCR text for extraction
            result = await extractPrescriptionWithGemini(
                ocr_text,
                prescription_id,
                'image' // Default to image, could be passed as parameter
            );
        }

        // Validate result against schema
        const validated = PrescriptionExtractSchema.parse(result);

        return NextResponse.json(validated);

    } catch (error) {
        console.error('[API/Extract] Error:', error);

        if (error instanceof Error) {
            // Check for Zod validation errors
            if (error.name === 'ZodError') {
                return NextResponse.json(
                    { error: 'Invalid extraction result format. Please try again.' },
                    { status: 422 }
                );
            }

            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to extract prescription data. Please try again.' },
            { status: 500 }
        );
    }
}
