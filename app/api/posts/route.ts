import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/postsService';
import * as constants from '@/lib/constants';
import { logger } from '@/lib/logger';
import type { PostsApiResponse, CleanPost, ApiErrorResponse } from '@/lib/types';

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
                    'Cache-Control': `public, max-age=${constants.CACHE_DURATION_MS / constants.MILLISECONDS_PER_SECOND}`,
                },
            }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in /api/posts: ${errorMessage}`);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch posts',
                message: errorMessage,
            },
            { status: constants.HTTP_INTERNAL_ERROR }
        );
    }
}
