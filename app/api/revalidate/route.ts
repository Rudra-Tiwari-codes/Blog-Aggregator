import { NextResponse } from 'next/server';
import { clearCache, getPosts } from '@/lib/postsService';
import { logger } from '@/lib/logger';
import * as constants from '@/lib/constants';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/revalidate
 * Force a cache clear and fetch fresh posts from RSS feeds.
 * This endpoint can be called after publishing new blog posts.
 */
export async function POST(): Promise<NextResponse> {
    try {
        logger.info('Manual cache revalidation triggered');

        // Clear the in-memory cache
        clearCache();
        logger.info('Cache cleared successfully');

        // Force fetch fresh posts
        const posts = await getPosts(true);
        logger.info(`Fetched ${posts.length} fresh posts`);

        return NextResponse.json(
            {
                success: true,
                message: 'Cache revalidated successfully',
                postsCount: posts.length,
                timestamp: new Date().toISOString(),
            },
            {
                status: constants.HTTP_OK,
                headers: {
                    'Cache-Control': 'no-store',
                },
            }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Revalidation failed: ${errorMessage}`);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to revalidate cache',
                message: errorMessage,
            },
            { status: constants.HTTP_INTERNAL_ERROR }
        );
    }
}

/**
 * GET /api/revalidate
 * Health check for the revalidation endpoint
 */
export async function GET(): Promise<NextResponse> {
    return NextResponse.json(
        {
            success: true,
            message: 'Revalidation endpoint is available. Send a POST request to clear cache.',
            timestamp: new Date().toISOString(),
        },
        {
            status: constants.HTTP_OK,
            headers: {
                'Cache-Control': 'no-store',
            },
        }
    );
}
