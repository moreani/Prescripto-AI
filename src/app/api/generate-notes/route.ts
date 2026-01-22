import { NextRequest, NextResponse } from 'next/server';
import { PrescriptionExtract, NotesOutput, Medication } from '@/lib/schema';
import { formatFrequency, getTimingFromFrequency, formatFoodInstruction } from '@/lib/abbreviations';
import { getMockNotesOutput } from '@/lib/mock-data';

interface GenerateNotesRequest {
    prescription_id: string;
    medications: Medication[];
    follow_up?: string | null;
    tests?: string[] | null;
    // Clinical data
    patient_info?: {
        name?: string | null;
        age?: string | null;
        sex?: string | null;
        uhid?: string | null;
    } | null;
    date?: string | null;
    doctor_info?: {
        name?: string | null;
        qualifications?: string | null;
        hospital?: string | null;
    } | null;
    complaints?: string[] | null;
    vitals?: {
        bp?: string | null;
        pulse?: string | null;
        rbs?: string | null;
        fbs?: string | null;
        ppbs?: string | null;
        spo2?: string | null;
        temperature?: string | null;
    } | null;
    diagnosis?: string | null;
    advice?: string[] | null;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateNotesRequest = await request.json();
        const { prescription_id, medications, follow_up, tests, patient_info, date, doctor_info, complaints, vitals, diagnosis, advice } = body;

        if (!prescription_id || !medications) {
            return NextResponse.json(
                { error: 'prescription_id and medications are required' },
                { status: 400 }
            );
        }

        const isMockMode = process.env.MOCK_MODE === 'true';

        if (isMockMode && medications.length === 0) {
            // Return mock data if no medications provided in mock mode
            const mockResult = getMockNotesOutput(prescription_id);
            return NextResponse.json(mockResult);
        }

        // Generate schedule from medications
        const schedule = generateSchedule(medications);

        // Generate markdown notes with clinical data
        const notes_markdown = generateNotesMarkdown(medications, follow_up, tests, {
            patient_info,
            date,
            doctor_info,
            complaints,
            vitals,
            diagnosis,
            advice,
        });

        const result: NotesOutput = {
            prescription_id,
            notes_markdown,
            schedule,
            meds_display: medications,
            // Include clinical data in the output for the PDF generator
            patient_info: patient_info ? {
                name: patient_info.name || null,
                age: patient_info.age || null,
                sex: patient_info.sex || null,
                uhid: patient_info.uhid || null,
            } : null,
            date: date || null,
            doctor_info: doctor_info ? {
                name: doctor_info.name || null,
                qualifications: doctor_info.qualifications || null,
                hospital: doctor_info.hospital || null,
            } : null,
            complaints: complaints || null,
            vitals: vitals ? {
                bp: vitals.bp || null,
                pulse: vitals.pulse || null,
                rbs: vitals.rbs || null,
                fbs: vitals.fbs || null,
                ppbs: vitals.ppbs || null,
                spo2: vitals.spo2 || null,
                temperature: vitals.temperature || null,
            } : null,
            diagnosis: diagnosis || null,
            advice: advice || null,
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('[API/Generate-Notes] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate notes. Please try again.' },
            { status: 500 }
        );
    }
}

function generateSchedule(medications: Medication[]): NotesOutput['schedule'] {
    const schedule: NotesOutput['schedule'] = {
        morning: [],
        afternoon: [],
        evening: [],
        night: [],
        as_needed: [],
    };

    for (const med of medications) {
        const timing = med.timing || getTimingFromFrequency(med.frequency || '');

        const scheduleItem = {
            name: `${med.name}${med.strength ? ` ${med.strength}` : ''}`,
            dose: med.dose,
            instructions: med.food_instruction || (med.instructions?.[0] || null),
        };

        for (const time of timing) {
            switch (time.toLowerCase()) {
                case 'morning':
                    schedule.morning.push(scheduleItem);
                    break;
                case 'afternoon':
                    schedule.afternoon.push(scheduleItem);
                    break;
                case 'evening':
                    schedule.evening.push(scheduleItem);
                    break;
                case 'night':
                    schedule.night.push(scheduleItem);
                    break;
                case 'as_needed':
                case 'prn':
                case 'sos':
                    schedule.as_needed.push(scheduleItem);
                    break;
            }
        }
    }

    return schedule;
}

function generateNotesMarkdown(
    medications: Medication[],
    follow_up?: string | null,
    tests?: string[] | null,
    clinicalData?: {
        patient_info?: { name?: string | null; age?: string | null; sex?: string | null; uhid?: string | null; } | null;
        date?: string | null;
        doctor_info?: { name?: string | null; qualifications?: string | null; hospital?: string | null; } | null;
        complaints?: string[] | null;
        vitals?: { bp?: string | null; pulse?: string | null; rbs?: string | null; fbs?: string | null; ppbs?: string | null; spo2?: string | null; temperature?: string | null; } | null;
        diagnosis?: string | null;
        advice?: string[] | null;
    }
): string {
    let markdown = `## Prescription Summary\n\n`;

    // Patient & Doctor Info
    if (clinicalData?.patient_info || clinicalData?.doctor_info || clinicalData?.date) {
        if (clinicalData.date) {
            markdown += `**Date:** ${clinicalData.date}\n\n`;
        }
        if (clinicalData.doctor_info?.hospital) {
            markdown += `**Hospital:** ${clinicalData.doctor_info.hospital}\n`;
        }
        if (clinicalData.doctor_info?.name) {
            markdown += `**Doctor:** ${clinicalData.doctor_info.name}`;
            if (clinicalData.doctor_info.qualifications) {
                markdown += ` (${clinicalData.doctor_info.qualifications})`;
            }
            markdown += `\n`;
        }
        if (clinicalData.patient_info?.name) {
            markdown += `**Patient:** ${clinicalData.patient_info.name}`;
            if (clinicalData.patient_info.age) markdown += `, ${clinicalData.patient_info.age}`;
            if (clinicalData.patient_info.sex) markdown += `, ${clinicalData.patient_info.sex}`;
            markdown += `\n`;
        }
        markdown += `\n`;
    }

    // Complaints
    if (clinicalData?.complaints && clinicalData.complaints.length > 0) {
        markdown += `### Chief Complaints\n\n`;
        for (const complaint of clinicalData.complaints) {
            markdown += `- ${complaint}\n`;
        }
        markdown += `\n`;
    }

    // Vitals
    if (clinicalData?.vitals) {
        const vitals = clinicalData.vitals;
        const vitalsList: string[] = [];
        if (vitals.bp) vitalsList.push(`BP: ${vitals.bp}`);
        if (vitals.pulse) vitalsList.push(`Pulse: ${vitals.pulse}`);
        if (vitals.rbs) vitalsList.push(`RBS: ${vitals.rbs}`);
        if (vitals.fbs) vitalsList.push(`FBS: ${vitals.fbs}`);
        if (vitals.ppbs) vitalsList.push(`PPBS: ${vitals.ppbs}`);
        if (vitals.spo2) vitalsList.push(`SpO2: ${vitals.spo2}`);
        if (vitals.temperature) vitalsList.push(`Temp: ${vitals.temperature}`);

        if (vitalsList.length > 0) {
            markdown += `### Vitals\n\n`;
            markdown += `${vitalsList.join(' • ')}\n\n`;
        }
    }

    // Diagnosis
    if (clinicalData?.diagnosis) {
        markdown += `### Diagnosis\n\n`;
        markdown += `${clinicalData.diagnosis}\n\n`;
    }

    // Medications header
    markdown += `### Medications (${medications.length})\n\n`;

    for (let i = 0; i < medications.length; i++) {
        const med = medications[i];
        markdown += `**${i + 1}. ${med.name}**`;
        if (med.strength) markdown += ` ${med.strength}`;
        markdown += `\n`;

        const details: string[] = [];
        if (med.form) details.push(`Form: ${med.form}`);
        if (med.dose) details.push(`Dose: ${med.dose}`);
        if (med.frequency) details.push(`Frequency: ${formatFrequency(med.frequency)}`);
        if (med.duration_days) details.push(`Duration: ${med.duration_days} days`);
        if (med.food_instruction) details.push(`${formatFoodInstruction(med.food_instruction)}`);

        if (details.length > 0) {
            markdown += `- ${details.join(' • ')}\n`;
        }

        if (med.instructions && med.instructions.length > 0) {
            for (const inst of med.instructions) {
                markdown += `- ${inst}\n`;
            }
        }

        if (med.needs_confirmation.length > 0) {
            markdown += `- ⚠️ **Please verify:** ${med.needs_confirmation.join(', ')}\n`;
        }

        markdown += `\n`;
    }

    // Follow-up
    if (follow_up) {
        markdown += `### Follow-up\n\n`;
        markdown += `${follow_up}\n\n`;
    }

    // Tests
    if (tests && tests.length > 0) {
        markdown += `### Tests / Investigations\n\n`;
        for (const test of tests) {
            markdown += `- ${test}\n`;
        }
        markdown += `\n`;
    }

    // Important reminders
    markdown += `### Important Reminders\n\n`;
    markdown += `- Take your medications at the same time each day\n`;
    markdown += `- Complete the full course as prescribed\n`;
    markdown += `- Do not stop or change medications without consulting your doctor\n`;
    markdown += `- Contact your doctor if you experience any unusual symptoms\n\n`;

    // Disclaimer
    markdown += `---\n\n`;
    markdown += `**⚠️ Disclaimer**: This summary is for informational purposes only and does NOT constitute medical advice. `;
    markdown += `Always verify with your doctor or pharmacist before taking any medication.\n`;

    return markdown;
}
