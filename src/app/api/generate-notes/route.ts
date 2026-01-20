import { NextRequest, NextResponse } from 'next/server';
import { PrescriptionExtract, NotesOutput, Medication } from '@/lib/schema';
import { formatFrequency, getTimingFromFrequency, formatFoodInstruction } from '@/lib/abbreviations';
import { getMockNotesOutput } from '@/lib/mock-data';

interface GenerateNotesRequest {
    prescription_id: string;
    medications: Medication[];
    follow_up?: string | null;
    tests?: string[] | null;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateNotesRequest = await request.json();
        const { prescription_id, medications, follow_up, tests } = body;

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

        // Generate markdown notes
        const notes_markdown = generateNotesMarkdown(medications, follow_up, tests);

        const result: NotesOutput = {
            prescription_id,
            notes_markdown,
            schedule,
            meds_display: medications,
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
    tests?: string[] | null
): string {
    let markdown = `## Your Medication Summary\n\n`;

    markdown += `This prescription contains **${medications.length} medication${medications.length !== 1 ? 's' : ''}** `;
    markdown += `prescribed by your doctor. Please read the instructions carefully and follow them as directed.\n\n`;

    // Medication list
    markdown += `### Medications\n\n`;

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
