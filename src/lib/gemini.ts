import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrescriptionExtract, PrescriptionExtractSchema, Medication } from './schema';
import { getMockPrescriptionExtract } from './mock-data';

const EXTRACTION_PROMPT = `You are a medical prescription parser. Analyze the prescription text and extract ALL medication and treatment information into strict JSON format.

═══════════════════════════════════════════════════════════════
              ANTI-HALLUCINATION RULES (CRITICAL)
═══════════════════════════════════════════════════════════════

YOU MUST NEVER FABRICATE OR INVENT MEDICAL DATA.

1. ONLY extract what you can ACTUALLY SEE written in the prescription text
2. If a field is NOT visible/present, set it to null - DO NOT INVENT DATA
3. Diagnosis: Extract ONLY if explicitly written (Imp:, D/D:, Diagnosis:, ?)
   - If no diagnosis is written → set to null
4. Complaints: Extract ONLY if explicitly written (c/o, C/O, complaining of)
   - If no complaints are written → set to null or empty array
5. Vitals: Extract ONLY if actual numbers are visible (BP:, Pulse:, SpO2:, etc.)
   - If no vitals are recorded → set all vital fields to null
6. NEVER infer, guess, or assume clinical information
7. When in doubt, set to null - it's SAFER to miss data than to fabricate it

Fabricating medical data is DANGEROUS and could harm patients.

═══════════════════════════════════════════════════════════════

EXTRACTION RULES:
1. Extract EVERYTHING that is prescribed - medications, IV fluids, oral rehydration, supplements, and advice items
2. Items marked with "Adv:", arrows (→), or numbered lists are ALL prescriptions/treatments
3. "ORS", "Fluid intake", "Rest", "Diet" - these ARE medication/treatment items, include them!
4. If a field is unclear or missing, set it to null and add the field name to "needs_confirmation"
5. Expand common abbreviations:
   - OD/QD = Once daily
   - BD/BID = Twice daily  
   - TDS/TID = Three times daily
   - QID = Four times daily
   - HS = At bedtime
   - AC = Before meals
   - PC = After meals
   - SOS/PRN = As needed
   - stat = Immediately
   - IV = Intravenous
   - ORS = Oral Rehydration Solution
6. Calculate confidence scores (0.0-1.0) for each field based on clarity
7. Fields with confidence < 0.7 should be added to needs_confirmation

EXAMPLE - For this prescription:
"Adv: 10 5% Dextrose (IV) stat
→ Adequate fluid intake
→ ORS 2 sachets"

You should extract 3 medications:
1. 5% Dextrose - IV - stat - 10 units
2. Adequate fluid intake - oral - as needed
3. ORS - 2 sachets - as directed

═══════════════════════════════════════════════════════════════
              TIMING ARRAY RULES (CRITICAL)
═══════════════════════════════════════════════════════════════

The "timing" array must ONLY include times when dose is given:
- 1-0-1 notation → ["morning", "night"] (Twice daily - skip afternoon!)
- 1-1-1 notation → ["morning", "afternoon", "night"] (Three times daily)  
- 0-0-1 notation → ["night"] (Once at night)
- 1-0-0 notation → ["morning"] (Once in morning)
- BD/Twice daily → ["morning", "night"]
- TDS/Three times daily → ["morning", "afternoon", "night"]
- The MIDDLE number represents AFTERNOON. If it's 0, do NOT include afternoon!

OUTPUT FORMAT (strict JSON):
{
  "patient_info": {
    "name": "string or null - patient name",
    "age": "string or null - e.g., '19 years', '6 months'",
    "sex": "string or null - Male/Female",
    "uhid": "string or null - hospital ID if visible"
  },
  "date": "string or null - prescription date",
  "doctor_info": {
    "name": "string or null - doctor name",
    "qualifications": "string or null - MBBS, MD, etc.",
    "hospital": "string or null - hospital/clinic name"
  },
  "complaints": ["array of strings - what patient is complaining of (c/o items)"],
  "vitals": {
    "bp": "string or null - blood pressure e.g., '120/70 mmHg'",
    "pulse": "string or null - pulse rate e.g., '60 bpm'",
    "rbs": "string or null - random blood sugar e.g., '150 mg/dl'",
    "fbs": "string or null - fasting blood sugar e.g., '203 mg/dl'",
    "ppbs": "string or null - post-prandial blood sugar e.g., '293 mg/dl'",
    "spo2": "string or null - oxygen saturation e.g., '98%'",
    "temperature": "string or null - body temperature e.g., '98.6°F'"
  },
  "diagnosis": "string or null - Imp/Impression/Diagnosis",
  "medications": [
    {
      "name": "string - drug/treatment name (e.g., '5% Dextrose', 'ORS', 'Adequate fluid intake')",
      "strength": "string or null - e.g., '500mg', '5%', '5ml'",
      "form": "string or null - tablet, capsule, syrup, IV fluid, sachet, advice, etc.",
      "route": "string or null - oral, IV, topical, etc.",
      "dose": "string or null - e.g., '1 tablet', '2 sachets', '10 units'",
      "frequency": "string or null - expanded form like 'Twice daily', 'Immediately (stat)', 'As needed'",
      "timing": ["morning", "afternoon", "night", "as_needed - ONLY include times when dose is given per rules above"],
      "duration_days": "number or null",
      "food_instruction": "string or null - before food, after food, with food",
      "instructions": ["array of additional instructions or empty array"],
      "confidence": {
        "name": 0.0 to 1.0,
        "dose": 0.0 to 1.0
      },
      "needs_confirmation": ["list of field names that need confirmation"]
    }
  ],
  "advice": ["array of general advice like 'rest', 'drink fluids'"],
  "follow_up": "string or null",
  "tests": ["array of tests or null"]
}

IMPORTANT: Do NOT skip any item with arrows (→), numbers, or listed under Adv/Advice. They are all prescriptions!

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
            temperature: 0,      // Deterministic - no creativity
            topP: 0.8,           // Focus on high-probability tokens
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
            patient_info: parsed.patient_info || null,
            date: parsed.date || null,
            doctor_info: parsed.doctor_info || null,
            complaints: parsed.complaints || null,
            vitals: parsed.vitals || null,
            diagnosis: parsed.diagnosis || null,
            medications: parsed.medications || [],
            follow_up: parsed.follow_up || null,
            tests: parsed.tests || null,
            advice: parsed.advice || null,
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
            temperature: 0,      // Deterministic - no creativity
            topP: 0.8,           // Focus on high-probability tokens
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
            patient_info: parsed.patient_info || null,
            date: parsed.date || null,
            doctor_info: parsed.doctor_info || null,
            complaints: parsed.complaints || null,
            vitals: parsed.vitals || null,
            diagnosis: parsed.diagnosis || null,
            medications: parsed.medications || [],
            follow_up: parsed.follow_up || null,
            tests: parsed.tests || null,
            advice: parsed.advice || null,
        };

        const validated = PrescriptionExtractSchema.parse(extract);

        return validated;
    } catch (error) {
        console.error('[Gemini] Error extracting from image:', error);
        throw new Error('Failed to analyze prescription image. Please try again.');
    }
}
