import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMockOCRResult } from '@/lib/mock-data';
import { OCRResult } from '@/lib/schema';
import { validateOCRInput } from '@/lib/ocr';
import { preprocessPrescriptionImage } from '@/lib/image-preprocess';

/**
 * Use Gemini Vision to extract text from an image
 */
async function extractTextWithGeminiVision(
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
            maxOutputTokens: 8192, // Allow long responses
        },
    });

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };

    const prompt = `You are an EXPERT Indian Clinical Pharmacist with 30+ years of experience reading doctors' handwriting. Your task is to extract EVERY detail from this prescription accurately.

═══════════════════════════════════════════════════════════════
              🚨 CRITICAL PATIENT SAFETY DATA 🚨
═══════════════════════════════════════════════════════════════

FOR PEDIATRIC PRESCRIPTIONS (children), WEIGHT IS CRITICAL!
Look for: "Wt:", "Weight:", "W:", or a number followed by "kg" or "g"
⚠️ NEVER skip weight - it's needed to verify if doses are safe!

ALWAYS CAPTURE FROM HEADER:
• Name: (look after "Name:")
• Age: (look after "Age:" - could be months/years)
• Sex: (M/F after "Sex:")
• Weight: (number + kg/g after "Wt:" or "Weight:")
• Temperature: (after "Temp:")
• Date: (anywhere in header)

═══════════════════════════════════════════════════════════════
                    CRITICAL: READ EVERYTHING
═══════════════════════════════════════════════════════════════

⚠️ SCAN THE ENTIRE IMAGE MULTIPLE TIMES:
1. HEADER AREA: Patient details, weight, temp, date
2. MAIN BODY: Medications list
3. LEFT MARGIN: Often has tests/notes
4. RIGHT MARGIN: Duration markers, brackets
5. BOTTOM: Advice, follow-up
6. DIAGONAL/ROTATED TEXT

═══════════════════════════════════════════════════════════════
                    DRUG NAME RECOGNITION
═══════════════════════════════════════════════════════════════

🔴 CRITICAL: Only output drug names that ACTUALLY EXIST!
If unsure, mark as [UNCLEAR - verify with doctor]

PEDIATRIC DROPS (very common):
• T-minic drops (cold/cough)
• Asthakind drops (cough)
• Nasoclear drops / Nasal drops / Saline drops (nose clearing)
• Calpol drops (fever)
• Sinarest drops (cold)
• Coriminic drops (cold)
• Ondem drops (vomiting)
• Cyclopam drops (stomach pain)
• Colicaid drops (colic)
• Bonnisan drops (digestion)
• Practin drops (appetite)

NASAL/EYE/EAR:
• Nasoclear (saline nasal drops)
• Otrivin (nasal decongestant)
• Nasivion (nasal drops)
• Ciplox-D (eye/ear drops)
• Moxiflox (eye drops)

CREAMS/OINTMENTS:
• HH-zole cream (antifungal)
• Candid cream (antifungal)
• Soframycin (antibiotic cream)
• Betnovate (steroid cream)
• Clobetasol (steroid)
• Mupirocin / T-bact (antibiotic)

SYRUPS:
• Ascoril, Grilinctus, Alex (cough)
• Calpol, Crocin (fever)
• Augmentin, Azithral (antibiotic)
• Ondem, Emeset (vomiting)
• Gelusil, Digene (antacid)

ADULT TABLETS:
• Dolo 650, Crocin, Calpol (fever)
• Combiflam, Zerodol-P (pain)
• Pan D, Pantop D (acidity)
• Azithral, Augmentin (antibiotic)
• Montair-LC, Allegra (allergy)

═══════════════════════════════════════════════════════════════
                    DOSAGE NOTATION DECODER
═══════════════════════════════════════════════════════════════

TIMING PATTERNS:
• 0.3—0.3—0.3 means Morning—Afternoon—Night (TDS)
• 0.4—0.4—0.4 means same dose three times
• 1-0-1 means Morning and Night only (skip afternoon)
• 1-1-1 means all three times

DURATION (often in bracket on right side):
• } 3 days = applies to all medicines in bracket
• x 5d or x5 = for 5 days
• x 1w = for 1 week

DIAGNOSIS with duration:
• "Cold x 2 days" means Cold for past 2 days (symptom duration)
• "Cough x 3 days" means Cough for past 3 days

═══════════════════════════════════════════════════════════════
                    ANTI-HALLUCINATION RULES
═══════════════════════════════════════════════════════════════

❌ NEVER invent drug names that don't exist
❌ NEVER make up dosages not written
❌ If you can't read it clearly, write [UNCLEAR]
❌ Don't guess - if "Nasoclear" looks like "Nano..." it's still Nasoclear

✅ Bias towards REAL Indian drug names from the list above
✅ "Nasal drops" likely means Nasoclear or similar saline drops
✅ Weight written as "6.6" near "Wt" means 6.6 kg

═══════════════════════════════════════════════════════════════
                    OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

**CLINICAL CONTEXT**
• Doctor/Hospital: [Name]
• Date: [DD/MM/YY]
• Patient Name: [Name]
• Age: [X months/years]
• Sex: [M/F]
• Weight: [X.X kg] ← CRITICAL FOR CHILDREN
• Temperature: [X°F or °C]
• Diagnosis/Complaints: [What patient has, with duration]

**MEDICATIONS** (Total: X medicines)
| # | Type | Medicine Name | Dose | Morning | Afternoon | Night | Duration | Notes |
|---|------|---------------|------|---------|-----------|-------|----------|-------|
| 1 | Drops | T-minic | 0.3ml | ✓ | ✓ | ✓ | 3 days | For cold |
| 2 | Drops | Nasoclear | 2 drops | ✓ | - | ✓ | - | Nasal saline |
...

**ADVICE**
• [Any written advice]
• Follow-up: [Date if mentioned]

**⚠️ UNCLEAR/VERIFY**
• [List anything you couldn't read clearly]

═══════════════════════════════════════════════════════════════

Now read this prescription carefully.
CHECKLIST before responding:
☐ Did I capture the WEIGHT? (Critical for kids!)
☐ Did I capture ALL medicines?
☐ Are all drug names REAL drugs that exist?
☐ Did I check margins and brackets for duration?`; 


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
        let processedMimeType: string = actualMimeType;

        if (base64Data) {
            // Already have base64 data - preprocess it
            const rawBuffer = Buffer.from(base64Data, 'base64');
            console.log('[API/OCR] Preprocessing uploaded image...');
            const processed = await preprocessPrescriptionImage(rawBuffer, actualMimeType);
            imageBase64 = processed.base64;
            processedMimeType = processed.mimeType;
        } else if (file) {
            // Convert file to buffer and preprocess
            const arrayBuffer = await file.arrayBuffer();
            const rawBuffer = Buffer.from(arrayBuffer);
            console.log('[API/OCR] Preprocessing uploaded file...');
            const processed = await preprocessPrescriptionImage(rawBuffer, actualMimeType);
            imageBase64 = processed.base64;
            processedMimeType = processed.mimeType;
        } else {
            return NextResponse.json(
                { error: 'No file data provided.' },
                { status: 400 }
            );
        }

        // Extract text using Gemini Vision with preprocessed image
        const extractedText = await extractTextWithGeminiVision(imageBase64, processedMimeType);

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
