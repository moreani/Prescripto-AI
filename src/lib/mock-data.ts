import { PrescriptionExtract, OCRResult, NotesOutput } from './schema';

export const MOCK_OCR_TEXT = `Dr. Rajesh Kumar, MBBS, MD
Apollo Hospital, New Delhi
Date: 15/01/2024

Patient: Mr. Sharma
Age: 45 years

Rx:
1. Tab Metformin 500mg - 1 tab BD after food x 30 days
2. Tab Amlodipine 5mg - 1 tab OD morning x 30 days  
3. Cap Omeprazole 20mg - 1 cap AC morning x 14 days
4. Tab Paracetamol 650mg - 1 tab SOS for fever

Advice:
- Check blood sugar fasting after 2 weeks
- Follow up after 1 month
- Low salt diet recommended

Signature: Dr. R. Kumar`;

export const MOCK_OCR_RESULT: OCRResult = {
    prescription_id: 'mock-rx-001',
    ocr_text: MOCK_OCR_TEXT,
    source_type: 'image',
    pages_count: 1,
};

export const MOCK_PRESCRIPTION_EXTRACT: PrescriptionExtract = {
    prescription_id: 'mock-rx-001',
    source_type: 'image',
    ocr_text: MOCK_OCR_TEXT,
    medications: [
        {
            name: 'Metformin',
            strength: '500mg',
            form: 'Tablet',
            route: 'Oral',
            dose: '1 tablet',
            frequency: 'BD',
            timing: ['morning', 'night'],
            duration_days: 30,
            food_instruction: 'After food',
            instructions: ['Take with meals to reduce stomach upset'],
            confidence: {
                name: 0.95,
                strength: 0.92,
                frequency: 0.88,
                duration_days: 0.90,
                food_instruction: 0.85,
            },
            needs_confirmation: [],
        },
        {
            name: 'Amlodipine',
            strength: '5mg',
            form: 'Tablet',
            route: 'Oral',
            dose: '1 tablet',
            frequency: 'OD',
            timing: ['morning'],
            duration_days: 30,
            food_instruction: null,
            instructions: ['Take at the same time each day'],
            confidence: {
                name: 0.93,
                strength: 0.90,
                frequency: 0.95,
                duration_days: 0.88,
            },
            needs_confirmation: [],
        },
        {
            name: 'Omeprazole',
            strength: '20mg',
            form: 'Capsule',
            route: 'Oral',
            dose: '1 capsule',
            frequency: 'OD',
            timing: ['morning'],
            duration_days: 14,
            food_instruction: 'Before food',
            instructions: ['Take 30 minutes before breakfast'],
            confidence: {
                name: 0.91,
                strength: 0.89,
                frequency: 0.92,
                duration_days: 0.85,
                food_instruction: 0.80,
            },
            needs_confirmation: [],
        },
        {
            name: 'Paracetamol',
            strength: '650mg',
            form: 'Tablet',
            route: 'Oral',
            dose: '1 tablet',
            frequency: 'SOS',
            timing: ['as_needed'],
            duration_days: null,
            food_instruction: null,
            instructions: ['Take only when you have fever', 'Do not exceed 4 tablets in 24 hours'],
            confidence: {
                name: 0.96,
                strength: 0.94,
                frequency: 0.88,
            },
            needs_confirmation: ['duration_days'],
        },
    ],
    follow_up: 'Follow up after 1 month',
    tests: ['Check blood sugar fasting after 2 weeks'],
};

export const MOCK_NOTES_OUTPUT: NotesOutput = {
    prescription_id: 'mock-rx-001',
    notes_markdown: `## Your Medication Summary

This prescription contains **4 medications** prescribed by your doctor. Please read the instructions carefully and follow them as directed.

### Important Reminders
- Take your medications at the same time each day
- Complete the full course as prescribed
- Contact your doctor if you experience any unusual symptoms

### Follow-up Instructions
- Get your fasting blood sugar checked after 2 weeks
- Schedule a follow-up appointment after 1 month
- Follow a low-salt diet as recommended

---

**⚠️ Disclaimer**: This summary is for informational purposes only. Always verify with your doctor or pharmacist before taking any medication.`,
    schedule: {
        morning: [
            { name: 'Metformin 500mg', dose: '1 tablet', instructions: 'After breakfast' },
            { name: 'Amlodipine 5mg', dose: '1 tablet', instructions: null },
            { name: 'Omeprazole 20mg', dose: '1 capsule', instructions: '30 min before breakfast' },
        ],
        afternoon: [],
        evening: [],
        night: [
            { name: 'Metformin 500mg', dose: '1 tablet', instructions: 'After dinner' },
        ],
        as_needed: [
            { name: 'Paracetamol 650mg', dose: '1 tablet', instructions: 'For fever only (max 4/day)' },
        ],
    },
    meds_display: MOCK_PRESCRIPTION_EXTRACT.medications,
};

export function getMockOCRResult(prescriptionId: string): OCRResult {
    return {
        ...MOCK_OCR_RESULT,
        prescription_id: prescriptionId,
    };
}

export function getMockPrescriptionExtract(prescriptionId: string, ocrText: string): PrescriptionExtract {
    return {
        ...MOCK_PRESCRIPTION_EXTRACT,
        prescription_id: prescriptionId,
        ocr_text: ocrText,
    };
}

export function getMockNotesOutput(prescriptionId: string): NotesOutput {
    return {
        ...MOCK_NOTES_OUTPUT,
        prescription_id: prescriptionId,
    };
}
