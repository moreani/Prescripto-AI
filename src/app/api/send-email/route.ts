import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { NotesOutput } from '@/lib/schema';
import { formatFrequency } from '@/lib/abbreviations';
import { sendEmail, generatePrescriptionEmailHTML } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, notes }: { email: string; notes: NotesOutput } = body;

        // Validate input
        if (!email) {
            return NextResponse.json(
                { error: 'Email address is required' },
                { status: 400 }
            );
        }

        if (!notes || !notes.prescription_id) {
            return NextResponse.json(
                { error: 'Notes data is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address format' },
                { status: 400 }
            );
        }

        // Generate PDF (reusing logic from export/pdf route)
        const { prescription_id, schedule, meds_display } = notes;

        const doc = new jsPDF();
        let yPosition = 20;
        const leftMargin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - leftMargin * 2;

        const checkPageBreak = (requiredSpace: number = 30) => {
            if (yPosition > doc.internal.pageSize.getHeight() - requiredSpace) {
                doc.addPage();
                yPosition = 20;
            }
        };

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('PrescriptoAI', leftMargin, yPosition);
        yPosition += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Medication Summary', leftMargin, yPosition);
        yPosition += 5;

        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, leftMargin, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 15;

        // Disclaimer
        doc.setFillColor(255, 248, 220);
        doc.rect(leftMargin, yPosition - 5, contentWidth, 20, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const disclaimer = 'IMPORTANT: This summary is for informational purposes only. Always verify with your doctor or pharmacist.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
        doc.text(disclaimerLines, leftMargin + 5, yPosition);
        yPosition += 25;

        // Schedule Table
        checkPageBreak(60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Medication Schedule', leftMargin, yPosition);
        yPosition += 10;

        const scheduleData = [
            { time: 'Morning', meds: schedule.morning },
            { time: 'Afternoon', meds: schedule.afternoon },
            { time: 'Evening', meds: schedule.evening },
            { time: 'Night', meds: schedule.night },
            { time: 'As Needed', meds: schedule.as_needed },
        ];

        doc.setFontSize(10);
        for (const slot of scheduleData) {
            if (slot.meds.length > 0) {
                checkPageBreak(20 + slot.meds.length * 8);

                doc.setFont('helvetica', 'bold');
                doc.setFillColor(240, 240, 240);
                doc.rect(leftMargin, yPosition - 4, contentWidth, 8, 'F');
                doc.text(slot.time, leftMargin + 2, yPosition);
                yPosition += 10;

                doc.setFont('helvetica', 'normal');
                for (const med of slot.meds) {
                    const medText = `• ${med.name}${med.dose ? ` - ${med.dose}` : ''}${med.instructions ? ` (${med.instructions})` : ''}`;
                    const lines = doc.splitTextToSize(medText, contentWidth - 10);
                    doc.text(lines, leftMargin + 5, yPosition);
                    yPosition += lines.length * 5 + 3;
                }
                yPosition += 3;
            }
        }
        yPosition += 10;

        // Medication Details
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Medication Details', leftMargin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        for (let i = 0; i < meds_display.length; i++) {
            const med = meds_display[i];
            checkPageBreak(50);

            doc.setFillColor(59, 130, 246);
            doc.rect(leftMargin, yPosition - 4, contentWidth, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1}. ${med.name}${med.strength ? ` ${med.strength}` : ''}`, leftMargin + 3, yPosition + 2);
            doc.setTextColor(0, 0, 0);
            yPosition += 12;

            doc.setFont('helvetica', 'normal');
            const details = [
                med.form ? `Form: ${med.form}` : null,
                med.dose ? `Dose: ${med.dose}` : null,
                med.frequency ? `Frequency: ${formatFrequency(med.frequency)}` : null,
                med.duration_days ? `Duration: ${med.duration_days} days` : null,
                med.food_instruction ? `Food: ${med.food_instruction}` : null,
            ].filter(Boolean);

            for (const detail of details) {
                doc.text(detail!, leftMargin + 5, yPosition);
                yPosition += 5;
            }

            if (med.instructions && med.instructions.length > 0) {
                doc.text('Instructions:', leftMargin + 5, yPosition);
                yPosition += 5;
                for (const inst of med.instructions) {
                    const instLines = doc.splitTextToSize(`  - ${inst}`, contentWidth - 15);
                    doc.text(instLines, leftMargin + 8, yPosition);
                    yPosition += instLines.length * 4 + 2;
                }
            }

            yPosition += 8;
        }

        // Footer
        yPosition = doc.internal.pageSize.getHeight() - 25;
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        const footerText = 'This document was generated by PrescriptoAI for informational purposes only.';
        doc.text(footerText, leftMargin, yPosition);

        // Convert PDF to buffer for email attachment
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        // Send email with PDF attachment
        const emailResult = await sendEmail({
            to: email,
            subject: '💊 Your Prescription Notes from PrescriptoAI',
            html: generatePrescriptionEmailHTML(prescription_id),
            attachments: [
                {
                    filename: `prescription-notes-${prescription_id.slice(0, 8)}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        if (!emailResult.success) {
            return NextResponse.json(
                { error: emailResult.error || 'Failed to send email' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
        });

    } catch (error) {
        console.error('[API/Send-Email] Error:', error);
        return NextResponse.json(
            { error: 'Failed to send email. Please try again.' },
            { status: 500 }
        );
    }
}
