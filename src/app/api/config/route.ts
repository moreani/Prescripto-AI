import { NextResponse } from 'next/server';

export async function GET() {
    const isTestMode = process.env.TEST_MODE === 'true';

    return NextResponse.json({
        testMode: isTestMode,
    });
}
