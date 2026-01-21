import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrescriptionExtract, PrescriptionExtractSchema, Medication } from './schema';
import { getMockPrescriptionExtract } from './mock-data';

const EXTRACTION_PROMPT = `You are a medical prescription parser. Analyze the following OCR text from a prescription and extract medication information into a strict JSON format.

RULES:
1. Extract ONLY what is explicitly written - never guess or infer missing information
2. If a field is unclear or missing, set it to null and add the field name to "needs_confirmation"
3. Expand common abbreviations but preserve the original in your understanding:
   - OD/QD = Once daily
   - BD/BID = Twice daily  
   - TDS/TID = Three times daily
   - QID = Four times daily
   - HS = At bedtime
   - AC = Before meals
   - PC = After meals
   - SOS/PRN = As needed
4. Calculate confidence scores (0.0-1.0) for each field based on clarity
5. Fields with confidence < 0.7 should be added to needs_confirmation

OUTPUT FORMAT (strict JSON):
{
  "medications": [
    {
      "name": "string - exact drug name",
      "strength": "string or null - e.g., '500mg', '5ml'",
      "form": "string or null - tablet, capsule, syrup, etc.",
      "route": "string or null - oral, topical, etc.",
      "dose": "string or null - e.g., '1 tablet', '5ml'",
      "frequency": "string or null - e.g., 'BD', 'TDS', 'OD'",
      "timing": ["array of strings or null - morning, afternoon, night, as_needed"],
      "duration_days": "number or null",
      "food_instruction": "string or null - before food, after food, with food",
      "instructions": ["array of additional instructions or null"],
      "confidence": {
        "field_name": 0.0 to 1.0
      },
      "needs_confirmation": ["list of field names that need confirmation"]
    }
  ],
  "follow_up": "string or null",
  "tests": ["array of tests or null"]
}

OCR TEXT TO ANALYZE:
`;

export async function extractPrescriptionWithGemini(
    ocrText: string,
    prescriptionId: string,
    sourceType: 'image' | 'pdf' = 'image'
): Promise<PrescriptionExtract> {
    const isMockMode = process.env.MOCK_MODE === 'true';

    if (isMockMode) {
        console.log('[Gemini] Mock mode enabled, returning mock data');
        return getMockPrescriptionExtract(prescriptionId, ocrText);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
        model,
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });

    const prompt = EXTRACTION_PROMPT + ocrText;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        const parsed = JSON.parse(text);

        // Construct the full prescription extract
        const extract: PrescriptionExtract = {
            prescription_id: prescriptionId,
            source_type: sourceType,
            ocr_text: ocrText,
            medications: parsed.medications || [],
            follow_up: parsed.follow_up || null,
            tests: parsed.tests || null,
        };

        // Validate with Zod schema
        const validated = PrescriptionExtractSchema.parse(extract);

        return validated;
    } catch (error) {
        console.error('[Gemini] Error extracting prescription:', error);
        throw new Error('Failed to extract prescription data. Please try again.');
    }
}

export async function extractPrescriptionFromImage(
    imageBase64: string,
    mimeType: string,
    prescriptionId: string
): Promise<PrescriptionExtract> {
    const isMockMode = process.env.MOCK_MODE === 'true';

    if (isMockMode) {
        console.log('[Gemini] Mock mode enabled, returning mock data');
        const { MOCK_OCR_TEXT } = await import('./mock-data');
        return getMockPrescriptionExtract(prescriptionId, MOCK_OCR_TEXT);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({
        model,
        generationConfig: {
            responseMimeType: 'application/json',
        },
    });

    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: mimeType,
        },
    };

    const prompt = `Analyze this prescription image and extract all medication information.

${EXTRACTION_PROMPT}

[Image provided above - analyze the prescription visible in the image]`;

    try {
        const result = await geminiModel.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const parsed = JSON.parse(text);

        const extract: PrescriptionExtract = {
            prescription_id: prescriptionId,
            source_type: 'image',
            ocr_text: parsed.ocr_text || 'OCR text extracted from image',
            medications: parsed.medications || [],
            follow_up: parsed.follow_up || null,
            tests: parsed.tests || null,
        };

        const validated = PrescriptionExtractSchema.parse(extract);

        return validated;
    } catch (error) {
        console.error('[Gemini] Error extracting from image:', error);
        throw new Error('Failed to analyze prescription image. Please try again.');
    }
}
