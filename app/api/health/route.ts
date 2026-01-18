import { NextResponse } from 'next/server';
import * as constants from '@/lib/constants';
import type { HealthApiResponse } from '@/lib/types';

// Track server start time for uptime calculation
const startTime = Date.now();

export async function GET(): Promise<NextResponse<HealthApiResponse>> {
    return NextResponse.json(
        {
            status: 'OK',
            uptime: (Date.now() - startTime) / 1000,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || constants.DEV_ENV,
        },
        { status: constants.HTTP_OK }
    );
}
