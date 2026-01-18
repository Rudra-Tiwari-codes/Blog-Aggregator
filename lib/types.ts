// TypeScript interfaces for the blog aggregator

export interface Post {
    title: string;
    link: string;
    published: string;
    content?: string;
    summary?: string;
    source: 'Medium' | 'Blogspot';
    embedding?: number[] | null;
}

export interface CleanPost {
    title: string;
    link: string;
    published: string;
    summary?: string;
    source: 'Medium' | 'Blogspot';
}

export interface SearchResult extends CleanPost {
    score?: number;
}

export interface PostsApiResponse {
    success: boolean;
    posts: CleanPost[];
    count: number;
    cached: boolean;
    timestamp: string;
}

export interface SearchApiResponse {
    success: boolean;
    results: SearchResult[];
    count: number;
    query: string;
    timestamp: string;
    message?: string;
}

export interface HealthApiResponse {
    status: string;
    uptime: number;
    timestamp: string;
    environment: string;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    message?: string;
}
