import { logger } from './logger';
import * as constants from './constants';
import {
    fetchBloggerPosts,
    fetchMediumPosts,
    generateSummary,
    deduplicatePosts,
} from './utils';
import type { Post } from './types';

// In-memory cache
let postsCache: Post[] | null = null;
let lastFetch: number | null = null;

/**
 * Fetch all posts from all sources
 */
async function fetchAllPosts(): Promise<Post[]> {
    logger.info('Starting to fetch posts from all sources...');
    const allPosts: Post[] = [];

    // Fetch from Blogger RSS
    try {
        logger.info('Fetching Blogspot posts...');
        const bloggerPosts = await fetchBloggerPosts();
        allPosts.push(...bloggerPosts);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error fetching Blogger posts: ${errorMessage}`);
    }

    // Fetch from Medium RSS
    try {
        const mediumUsername = process.env.MEDIUM_USERNAME || 'rudratech';
        logger.info(`Fetching Medium posts for @${mediumUsername}...`);
        const mediumPosts = await fetchMediumPosts(mediumUsername);
        allPosts.push(...mediumPosts);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error fetching Medium posts: ${errorMessage}`);
    }

    // Deduplicate posts
    const uniquePosts = deduplicatePosts(allPosts);

    // Ensure at least one source succeeded
    if (uniquePosts.length === 0) {
        throw new Error('All blog sources are currently unavailable. Please try again later.');
    }

    // Process posts with summaries
    const processed = uniquePosts.map((post) => {
        if (!post.summary && post.content) {
            post.summary = generateSummary(post.content);
        }
        return post;
    });

    // Sort by date (newest first)
    processed.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    logger.info(`Successfully processed ${processed.length} posts`);
    return processed;
}

/**
 * Get posts with caching
 */
export async function getPosts(forceRefresh = false): Promise<Post[]> {
    const now = Date.now();

    // Use in-memory cache if available and not expired
    if (
        !forceRefresh &&
        postsCache &&
        lastFetch &&
        now - lastFetch < constants.CACHE_DURATION_MS
    ) {
        logger.info(`Returning ${postsCache.length} posts from in-memory cache`);
        return postsCache;
    }

    // If we have a cache but it's stale, return it and refresh in background
    if (postsCache && postsCache.length > 0 && !forceRefresh) {
        logger.info('Cache is stale, triggering background refresh...');

        // Background refresh (fire and forget)
        fetchAllPosts()
            .then((posts) => {
                postsCache = posts;
                lastFetch = Date.now();
                logger.info('Background refresh completed');
            })
            .catch((err) => {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                logger.error(`Background refresh failed: ${errorMessage}`);
            });

        return postsCache;
    }

    // Fetch fresh posts
    const posts = await fetchAllPosts();
    postsCache = posts;
    lastFetch = now;

    return posts;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache(): void {
    postsCache = null;
    lastFetch = null;
    logger.info('Cache cleared');
}
