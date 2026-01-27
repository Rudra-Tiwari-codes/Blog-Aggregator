import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/postsService';
import * as constants from '@/lib/constants';
import { logger } from '@/lib/logger';
import type { PostsApiResponse, CleanPost, ApiErrorResponse } from '@/lib/types';

// Force dynamic rendering for this API route (required for serverless deployment)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Increase max duration for Vercel serverless (default is 10s, max is 60s on hobby)
export const maxDuration = 60;

export async function GET(
    request: Request
): Promise<NextResponse<PostsApiResponse | ApiErrorResponse>> {
    try {
        const { searchParams } = new URL(request.url);
        const forceRefresh = searchParams.get('refresh') === 'true';

        logger.info(`Fetching posts${forceRefresh ? ' (force refresh)' : ' (cached)'}`);

        const posts = await getPosts(forceRefresh);

        // Remove embeddings and content from response (they're large)
        const cleanPosts: CleanPost[] = posts.map((post) => ({
            title: post.title,
            link: post.link,
            published: post.published,
            summary: post.summary,
            source: post.source,
        }));

        return NextResponse.json(
            {
                success: true,
                posts: cleanPosts,
                count: cleanPosts.length,
                cached: !forceRefresh,
                timestamp: new Date().toISOString(),
            },
            {
                status: constants.HTTP_OK,
                headers: {
                    // Disable caching to ensure fresh data on each request
                    // The server handles its own in-memory caching
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                },
            }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        const errorName = error instanceof Error ? error.name : 'UnknownError';

        logger.error(`Error in /api/posts: ${errorName}: ${errorMessage}`);
        if (errorStack) {
            logger.error(`Stack trace: ${errorStack}`);
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch posts',
                message: errorMessage,
                details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
            },
            { status: constants.HTTP_INTERNAL_ERROR }
        );
    }
}

