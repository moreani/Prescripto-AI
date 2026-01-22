import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

/**
 * QA/Testing PDF Export Endpoint
 * 
 * Generates a PDF optimized for accuracy verification:
 * - Shows RAW transcription without any processing
 * - Does NOT expand abbreviations
 * - Does NOT format for patient readability
 * - Shows confidence notes and uncertainties
 * - Clearly marked as "FOR QA/TESTING ONLY"
 */

interface QAPDFRequest {
    prescription_id: string;
    raw_transcription: string;
    source_type: 'image' | 'pdf';
    timestamp?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: QAPDFRequest = await request.json();
        const { prescription_id, raw_transcription, source_type, timestamp } = body;

        if (!prescription_id || !raw_transcription) {
            return NextResponse.json(
                { error: 'prescription_id and raw_transcription are required' },
                { status: 400 }
            );
        }

        // Generate QA PDF
        const doc = new jsPDF();
        let yPosition = 15;
        const leftMargin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - leftMargin * 2;
        const lineHeight = 5;

        const checkPageBreak = (requiredSpace: number = 20) => {
            if (yPosition > pageHeight - requiredSpace) {
                doc.addPage();
                yPosition = 15;
                // Add "QA MODE" header on each page
                addPageHeader();
            }
        };

        const addPageHeader = () => {
            doc.setFillColor(220, 38, 38); // Red background
            doc.rect(0, 0, pageWidth, 10, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('QA MODE - RAW TRANSCRIPTION - NOT FOR PATIENT USE', pageWidth / 2, 7, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            yPosition = 18;
        };

        // First page header
        addPageHeader();

        // Title and metadata in one line
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Raw Transcription Report', leftMargin, yPosition);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`ID: ${prescription_id.slice(0, 8)} | ${timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString()}`, pageWidth - leftMargin, yPosition, { align: 'right' });
        yPosition += 8;

        // Draw a line
        doc.setDrawColor(200, 200, 200);
        doc.line(leftMargin, yPosition, leftMargin + contentWidth, yPosition);
        yPosition += 6;

        // Transcription content
        doc.setFontSize(9);
        doc.setFont('courier', 'normal'); // Monospace for raw text
        doc.setTextColor(30, 30, 30);

        // Split transcription into lines
        const transcriptionLines = raw_transcription.split('\n');

        for (const line of transcriptionLines) {
            checkPageBreak(lineHeight + 5);

            // Skip empty lines but add spacing
            if (!line.trim()) {
                yPosition += 2;
                continue;
            }

            // Handle section headers (HEADER:, MEDICATIONS:, etc.)
            if (line.match(/^[A-Z][A-Z\s\/]+:$/)) {
                yPosition += 3;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                doc.setTextColor(59, 130, 246); // Blue for headers
                doc.text(line, leftMargin, yPosition);
                doc.setFont('courier', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(30, 30, 30);
                yPosition += 6;
                continue;
            }

            // Handle [UNCLEAR] markers - highlight them
            if (line.includes('[UNCLEAR]') || line.includes('[PARTIAL:')) {
                doc.setTextColor(220, 38, 38); // Red for unclear
            } else {
                doc.setTextColor(30, 30, 30);
            }

            // Word wrap long lines
            const wrappedLines = doc.splitTextToSize(line, contentWidth - 5);
            
            for (const wrappedLine of wrappedLines) {
                checkPageBreak(lineHeight + 2);
                doc.text(wrappedLine, leftMargin + 3, yPosition);
                yPosition += lineHeight;
            }
        }

        // Footer on last page
        yPosition = pageHeight - 12;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('QA Report - PrescriptoAI - For testing only, not for patient use', pageWidth / 2, yPosition, { align: 'center' });

        // Convert to base64
        const pdfBase64 = doc.output('datauristring');

        return NextResponse.json({
            prescription_id,
            pdf_base64: pdfBase64,
            filename: `qa-transcription-${prescription_id.slice(0, 8)}.pdf`,
            mode: 'qa',
        });

    } catch (error) {
        console.error('[API/Export/QA-PDF] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate QA PDF. Please try again.' },
            { status: 500 }
        );
    }
}
