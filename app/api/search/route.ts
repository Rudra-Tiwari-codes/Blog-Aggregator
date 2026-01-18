import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/postsService';
import { semanticSearch } from '@/lib/utils';
import * as constants from '@/lib/constants';
import { logger } from '@/lib/logger';
import type { SearchApiResponse, SearchResult, ApiErrorResponse } from '@/lib/types';

interface SearchRequestBody {
    query?: string;
}

export async function POST(
    request: Request
): Promise<NextResponse<SearchApiResponse | ApiErrorResponse>> {
    try {
        const body: SearchRequestBody = await request.json().catch(() => ({}));
        const rawQuery = body?.query;

        if (!rawQuery || typeof rawQuery !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Query parameter is required and must be a string',
                },
                { status: constants.HTTP_BAD_REQUEST }
            );
        }

        const query = rawQuery.trim();

        if (query.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Query cannot be empty',
                },
                { status: constants.HTTP_BAD_REQUEST }
            );
        }

        if (query.length > constants.SEARCH_QUERY_MAX_LENGTH) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Query must be no more than ${constants.SEARCH_QUERY_MAX_LENGTH} characters`,
                },
                { status: constants.HTTP_BAD_REQUEST }
            );
        }

        logger.info(`Search request for: "${query}"`);

        // Load posts from cache
        const posts = await getPosts(false);

        if (!posts || posts.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    results: [],
                    count: 0,
                    query,
                    timestamp: new Date().toISOString(),
                    message: 'No posts available to search',
                },
                { status: constants.HTTP_OK }
            );
        }

        // Perform search
        const apiKey = process.env.GEMINI_API_KEY;
        const results = await semanticSearch(query, posts, apiKey, constants.SEARCH_RESULTS_LIMIT);

        // Clean results (remove embeddings and raw content)
        const cleanResults: SearchResult[] = results.map((post) => ({
            title: post.title,
            link: post.link,
            published: post.published,
            summary: post.summary,
            source: post.source,
            score: post.score,
        }));

        logger.info(`Search found ${cleanResults.length} results for "${query}"`);

        return NextResponse.json(
            {
                success: true,
                results: cleanResults,
                count: cleanResults.length,
                query,
                timestamp: new Date().toISOString(),
            },
            { status: constants.HTTP_OK }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error in /api/search: ${errorMessage}`);

        return NextResponse.json(
            {
                success: false,
                error: 'Search failed',
                message: errorMessage,
            },
            { status: constants.HTTP_INTERNAL_ERROR }
        );
    }
}
