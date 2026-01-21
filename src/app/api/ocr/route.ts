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

    const prompt = `You are an EXPERT medical prescription reader with 30+ years of experience decoding doctors' handwriting. You have successfully read thousands of prescriptions from Indian hospitals and clinics.

═══════════════════════════════════════════════════════════════
                    READING STRATEGY
═══════════════════════════════════════════════════════════════

STEP 1 - SCAN THE DOCUMENT:
• Identify the printed header (hospital/clinic info)
• Locate handwritten sections
• Find medication list (usually numbered or bulleted)
• Spot any stamps, signatures, or dates

STEP 2 - READ SYSTEMATICALLY (Top to Bottom, Left to Right):
• Start with printed text (easier) to establish context
• Then tackle handwritten portions
• For difficult words, look at individual letters
• Use surrounding context to guess unclear words

STEP 3 - VERIFY MEDICATIONS:
• Cross-reference drug names against common prescriptions
• Check that dosages make medical sense
• Ensure frequencies match standard patterns

═══════════════════════════════════════════════════════════════
                    MEDICAL ABBREVIATIONS DICTIONARY
═══════════════════════════════════════════════════════════════

PATIENT HISTORY:
• c/o = Complaining of
• H/o = History of
• K/c/o = Known case of
• N/K/C = Not a known case
• NKDA = No known drug allergies
• LMP = Last menstrual period

VITALS & MEASUREMENTS:
• BP = Blood Pressure (format: 120/80 mmHg)
• PR = Pulse Rate (format: 72/min or 72 bpm)
• RBS = Random Blood Sugar
• FBS = Fasting Blood Sugar
• SpO2 = Oxygen saturation
• Temp = Temperature
• Wt = Weight, Ht = Height

DIAGNOSIS:
• Imp = Impression (diagnosis)
• D/D = Differential diagnosis
• ? = Query/Suspected
• AGE = Acute gastroenteritis
• URTI = Upper respiratory tract infection
• UTI = Urinary tract infection
• LRTI = Lower respiratory tract infection
• HTN = Hypertension
• DM = Diabetes mellitus
• CKD = Chronic kidney disease

MEDICATIONS:
• Tab / T. = Tablet
• Cap / C. = Capsule
• Inj = Injection
• Syr = Syrup
• Drops / Gtt = Drops
• Oint = Ointment
• Susp = Suspension
• Neb = Nebulization
• IV = Intravenous
• IM = Intramuscular
• SC = Subcutaneous
• PO = Per oral (by mouth)

FREQUENCY & TIMING:
• OD = Once daily
• BD = Twice daily (Bis die)
• TDS / TID = Three times daily
• QID = Four times daily
• HS = At bedtime (Hora somni)
• SOS / PRN = As needed
• stat = Immediately
• AC = Before meals (Ante cibum)
• PC = After meals (Post cibum)
• q4h, q6h, q8h = Every 4/6/8 hours

DURATION:
• x 3d = for 3 days
• x 1w = for 1 week
• x 2/52 = for 2 weeks
• x 1/12 = for 1 month

COMMON DRUG NAMES (look for these patterns):
• Paracetamol, Dolo, Crocin, Calpol (fever)
• Azithromycin, Augmentin, Amoxicillin (antibiotics)
• Pantoprazole, Omeprazole, Rabeprazole (acidity)
• Ondansetron, Domperidone, Emeset (vomiting)
• Cetirizine, Levocetirizine, Allegra (allergy)
• Montelukast, Montair (respiratory)
• ORS, Electral, Pedialyte (dehydration)
• Metformin, Glimepiride (diabetes)
• Amlodipine, Telmisartan (BP)
• Vitamin D3, Calcium, B-complex (supplements)

═══════════════════════════════════════════════════════════════
                    INDIAN PRESCRIPTION PATTERNS
═══════════════════════════════════════════════════════════════

HEADER (Usually Printed):
• Hospital/Clinic name (may include Hindi/regional script)
• Doctor's name with qualifications (MBBS, MD, MS, DM, etc.)
• Registration number (e.g., KMC 12345, MCI 67890)
• Contact info, address

HANDWRITTEN SECTION:
• Date (DD/MM/YY or DD-MM-YYYY)
• Patient name, age, sex written first
• "Rx" symbol marks start of prescription
• Numbered medications (1, 2, 3...) or circled numbers
• Circled quantities indicate number of tablets/doses
• Arrows (→) show instructions
• "Adv:" or "Advice:" section at end
• Follow-up date often mentioned

REGIONAL LANGUAGES:
• If Hindi, Kannada, Tamil, Telugu text visible, transliterate to English
• Common words: Dawai (medicine), Bukhar (fever), Pet dard (stomach pain)

═══════════════════════════════════════════════════════════════
                    STRICT OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

You MUST respond in EXACTLY this format. Fill ALL fields. Use [?] for uncertain readings, but NEVER leave empty:

---
DATE: [DD/MM/YYYY or as written]

HOSPITAL/CLINIC: [Full name from header]
ADDRESS: [If visible]
PHONE: [If visible]

DOCTOR: [Full name]
QUALIFICATIONS: [MBBS, MD, etc.]
REGISTRATION: [Reg number if visible]

PATIENT NAME: [Full name]
AGE: [Number] years/months
SEX: [Male/Female]
UHID/ID: [If any ID visible]

CHIEF COMPLAINTS (c/o):
• [Complaint 1]
• [Complaint 2]

HISTORY (H/o):
• [Relevant history]

VITALS:
• BP: [value or "Not recorded"]
• Pulse: [value or "Not recorded"]
• SpO2: [value or "Not recorded"]
• Temperature: [value or "Not recorded"]

DIAGNOSIS/IMPRESSION:
[Primary diagnosis]

MEDICATIONS (Rx):
1. [Drug name] [Strength] - [Dose] [Frequency] - [Duration] - [Special instructions]
2. [Drug name] [Strength] - [Dose] [Frequency] - [Duration] - [Special instructions]
3. [Continue for ALL medications...]

INVESTIGATIONS ADVISED:
• [Any tests ordered]

ADVICE:
• [Diet, rest, precautions]

FOLLOW-UP: [Date or duration]

NOTES: [Any other text visible on prescription]
---

═══════════════════════════════════════════════════════════════
                    CRITICAL REMINDERS
═══════════════════════════════════════════════════════════════

1. NEVER give up on difficult handwriting - try letter by letter
2. Use medical context to make educated guesses
3. Common medicines have recognizable patterns even in bad handwriting
4. Mark uncertain readings with [?] but always provide your best guess
5. Look at the ENTIRE image including margins, stamps, and watermarks
6. If you see numbers, they are likely: dates, quantities, or dosages
7. Prescription quantities are often circled (e.g., ⑩ = 10 tablets)

NOW, carefully examine this prescription image and extract ALL information:`;

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
