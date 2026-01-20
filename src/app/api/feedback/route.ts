import { NextRequest, NextResponse } from 'next/server';
import { Feedback, FeedbackSchema } from '@/lib/schema';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate feedback data
        const feedback: Feedback = FeedbackSchema.parse({
            prescription_id: body.prescription_id,
            helpful: body.helpful ?? null,
            issue_type: body.issue_type ?? null,
            comment: body.comment ?? null,
            timestamp: new Date().toISOString(),
        });

        // In production, save feedback to database
        // For MVP, just log (without PHI)
        console.log('[API/Feedback] Received feedback:', {
            prescription_id: feedback.prescription_id,
            helpful: feedback.helpful,
            issue_type: feedback.issue_type,
            hasComment: !!feedback.comment,
            timestamp: feedback.timestamp,
        });

        // TODO: In production:
        // 1. Save to database (PostgreSQL, MongoDB, etc.)
        // 2. Send to analytics (privacy-safe)
        // 3. Trigger alerts for critical issues

        return NextResponse.json({
            success: true,
            message: 'Thank you for your feedback!',
        });

    } catch (error) {
        console.error('[API/Feedback] Error:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid feedback data' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to submit feedback. Please try again.' },
            { status: 500 }
        );
    }
}
