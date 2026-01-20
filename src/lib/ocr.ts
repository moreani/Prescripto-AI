import { OCRResult } from './schema';
import { getMockOCRResult, MOCK_OCR_TEXT } from './mock-data';
import { v4 as uuidv4 } from 'uuid';

export interface OCRInput {
    file: File | Blob;
    filename: string;
    mimeType: string;
}

/**
 * Process a file through OCR
 * In MVP, this returns mock data. 
 * TODO: Integrate real OCR service (Google Cloud Vision, Azure, Tesseract, etc.)
 */
export async function processOCR(input: OCRInput): Promise<OCRResult> {
    const isMockMode = process.env.MOCK_MODE === 'true';
    const prescriptionId = uuidv4();

    if (isMockMode) {
        console.log('[OCR] Mock mode enabled, returning mock OCR result');
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return getMockOCRResult(prescriptionId);
    }

    // TODO: Implement real OCR
    // For now, throw error in non-mock mode until OCR service is configured
    throw new Error('Real OCR not implemented yet. Set MOCK_MODE=true in .env.local');
}

/**
 * Process base64 encoded file through OCR
 */
export async function processOCRFromBase64(
    base64Data: string,
    mimeType: string,
    filename: string
): Promise<OCRResult> {
    const isMockMode = process.env.MOCK_MODE === 'true';
    const prescriptionId = uuidv4();

    if (isMockMode) {
        console.log('[OCR] Mock mode enabled, returning mock OCR result');
        await new Promise(resolve => setTimeout(resolve, 800));
        return getMockOCRResult(prescriptionId);
    }

    // Determine source type from mime type
    const sourceType: 'image' | 'pdf' = mimeType === 'application/pdf' ? 'pdf' : 'image';
    const pagesCount = sourceType === 'pdf' ? 1 : 1; // TODO: count actual pages for PDF

    // TODO: Implement real OCR service integration
    // Example integration points:
    // - Google Cloud Vision API
    // - Azure Cognitive Services
    // - AWS Textract
    // - Tesseract.js (client-side)

    throw new Error('Real OCR not implemented yet. Set MOCK_MODE=true in .env.local');
}

/**
 * Validate that the file is an acceptable format for OCR
 */
export function validateOCRInput(mimeType: string): boolean {
    const acceptedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf',
    ];
    return acceptedTypes.includes(mimeType.toLowerCase());
}

/**
 * Get file type label for display
 */
export function getFileTypeLabel(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('png')) return 'PNG Image';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG Image';
    if (mimeType.includes('webp')) return 'WebP Image';
    return 'File';
}
