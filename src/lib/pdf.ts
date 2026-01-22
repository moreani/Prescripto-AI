import { jsPDF } from 'jspdf';
import { NotesOutput, Medication } from './schema';
import { formatFrequency, expandAbbreviation } from './abbreviations';

export interface PDFGenerationOptions {
    includeDisclaimer: boolean;
    includeSchedule: boolean;
    includeMedicationDetails: boolean;
}

const DEFAULT_OPTIONS: PDFGenerationOptions = {
    includeDisclaimer: true,
    includeSchedule: true,
    includeMedicationDetails: true,
};

/**
 * Generate a PDF from the notes output
 */
export function generatePDF(
    notes: NotesOutput,
    options: PDFGenerationOptions = DEFAULT_OPTIONS
): jsPDF {
    const doc = new jsPDF();
    let yPosition = 20;
    const leftMargin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - leftMargin * 2;

    // Helper to add new page if needed
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

    // Disclaimer at top
    if (options.includeDisclaimer) {
        doc.setFillColor(255, 248, 220);
        doc.rect(leftMargin, yPosition - 5, contentWidth, 20, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        const disclaimer = 'IMPORTANT: This summary is for informational purposes only. Always verify with your doctor or pharmacist.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
        doc.text(disclaimerLines, leftMargin + 5, yPosition);
        yPosition += 25;
    }

    // Clinical Data Section (if available in notes)
    const clinicalData = (notes as any).clinicalData;
    if (clinicalData) {
        // Patient & Doctor Info
        if (clinicalData.date || clinicalData.doctor_info || clinicalData.patient_info) {
            checkPageBreak(40);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            if (clinicalData.date) {
                doc.setFont('helvetica', 'bold');
                doc.text('Date: ', leftMargin, yPosition);
                doc.setFont('helvetica', 'normal');
                doc.text(clinicalData.date, leftMargin + 15, yPosition);
                yPosition += 6;
            }

            if (clinicalData.doctor_info?.hospital) {
                doc.setFont('helvetica', 'bold');
                doc.text('Hospital: ', leftMargin, yPosition);
                doc.setFont('helvetica', 'normal');
                doc.text(clinicalData.doctor_info.hospital, leftMargin + 20, yPosition);
                yPosition += 6;
            }

            if (clinicalData.doctor_info?.name) {
                doc.setFont('helvetica', 'bold');
                doc.text('Doctor: ', leftMargin, yPosition);
                doc.setFont('helvetica', 'normal');
                let doctorText = clinicalData.doctor_info.name;
                if (clinicalData.doctor_info.qualifications) {
                    doctorText += ` (${clinicalData.doctor_info.qualifications})`;
                }
                doc.text(doctorText, leftMargin + 18, yPosition);
                yPosition += 6;
            }

            if (clinicalData.patient_info?.name) {
                doc.setFont('helvetica', 'bold');
                doc.text('Patient: ', leftMargin, yPosition);
                doc.setFont('helvetica', 'normal');
                let patientText = clinicalData.patient_info.name;
                if (clinicalData.patient_info.age) patientText += `, ${clinicalData.patient_info.age}`;
                if (clinicalData.patient_info.sex) patientText += `, ${clinicalData.patient_info.sex}`;
                doc.text(patientText, leftMargin + 18, yPosition);
                yPosition += 6;
            }
            yPosition += 5;
        }

        // Complaints
        if (clinicalData.complaints && clinicalData.complaints.length > 0) {
            checkPageBreak(30);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Chief Complaints', leftMargin, yPosition);
            yPosition += 7;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            for (const complaint of clinicalData.complaints) {
                doc.text(`• ${complaint}`, leftMargin + 5, yPosition);
                yPosition += 5;
            }
            yPosition += 5;
        }

        // Vitals
        if (clinicalData.vitals) {
            const vitals = clinicalData.vitals;
            const vitalsList: string[] = [];
            if (vitals.bp) vitalsList.push(`BP: ${vitals.bp}`);
            if (vitals.pulse) vitalsList.push(`Pulse: ${vitals.pulse}`);
            if (vitals.rbs) vitalsList.push(`RBS: ${vitals.rbs}`);
            if (vitals.spo2) vitalsList.push(`SpO2: ${vitals.spo2}`);
            if (vitals.temperature) vitalsList.push(`Temp: ${vitals.temperature}`);

            if (vitalsList.length > 0) {
                checkPageBreak(20);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Vitals', leftMargin, yPosition);
                yPosition += 7;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(vitalsList.join('  •  '), leftMargin + 5, yPosition);
                yPosition += 10;
            }
        }

        // Diagnosis
        if (clinicalData.diagnosis) {
            checkPageBreak(20);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Diagnosis', leftMargin, yPosition);
            yPosition += 7;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const diagLines = doc.splitTextToSize(clinicalData.diagnosis, contentWidth - 10);
            doc.text(diagLines, leftMargin + 5, yPosition);
            yPosition += diagLines.length * 5 + 5;
        }

        yPosition += 5;
    }

    // Schedule Table
    if (options.includeSchedule) {
        checkPageBreak(60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Medication Schedule', leftMargin, yPosition);
        yPosition += 10;

        const scheduleData = [
            { time: 'Morning', meds: notes.schedule.morning },
            { time: 'Afternoon', meds: notes.schedule.afternoon },
            { time: 'Evening', meds: notes.schedule.evening },
            { time: 'Night', meds: notes.schedule.night },
            { time: 'As Needed', meds: notes.schedule.as_needed },
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
    }

    // Medication Details
    if (options.includeMedicationDetails) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Medication Details', leftMargin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        for (let i = 0; i < notes.meds_display.length; i++) {
            const med = notes.meds_display[i];
            checkPageBreak(50);

            // Medication name box
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
    }

    // Footer disclaimer
    checkPageBreak(30);
    yPosition = doc.internal.pageSize.getHeight() - 25;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const footerText = 'This document was generated by PrescriptoAI for informational purposes only. It is not a substitute for professional medical advice.';
    const footerLines = doc.splitTextToSize(footerText, contentWidth);
    doc.text(footerLines, leftMargin, yPosition);

    return doc;
}

/**
 * Generate PDF and return as base64 string
 */
export function generatePDFBase64(
    notes: NotesOutput,
    options?: PDFGenerationOptions
): string {
    const doc = generatePDF(notes, options);
    return doc.output('datauristring');
}

/**
 * Generate PDF and return as Blob
 */
export function generatePDFBlob(
    notes: NotesOutput,
    options?: PDFGenerationOptions
): Blob {
    const doc = generatePDF(notes, options);
    return doc.output('blob');
}

/**
 * Generate PDF and trigger download
 */
export function downloadPDF(
    notes: NotesOutput,
    filename: string = 'prescription-notes.pdf',
    options?: PDFGenerationOptions
): void {
    const doc = generatePDF(notes, options);
    doc.save(filename);
}
