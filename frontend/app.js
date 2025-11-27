/**
 * ============================================
 * RUDRA'S BLOG AGGREGATOR - Main JavaScript
 * ============================================
 * 
 * A clean, modular script that:
 * 1. Fetches posts from Medium and Blogspot via backend API
 * 2. Cleans HTML content (strips tags, decodes entities)
 * 3. Renders posts in a beautiful two-column layout
 * 4. Includes loading states and error handling
 * 5. Supports future AI-powered search integration
 * 
 * Author: Rudra Tiwari
 * Last Updated: November 2025
 */

// ============================================
// Global Configuration
// ============================================
const API_BASE = window.location.origin === 'http://localhost:3000' || window.location.origin.includes('localhost') 
    ? window.location.origin 
    : 'https://rudra-blog-aggregator.vercel.app';
const MAX_SUMMARY_LENGTH = 200;

// ============================================
// DOM Elements (cached for performance)
// ============================================
let loadingScreen, errorMessage, errorText;
let postsContainer, mediumPosts, blogspotPosts;
let mediumCount, blogspotCount;
let searchInput, searchButton, searchResults, resultsGrid, resultsTitle, clearSearch;
let latestPost, latestPostCard;

// ============================================
// Initialize App on DOM Load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Cache all DOM elements
    loadingScreen = document.getElementById('loadingScreen');
    errorMessage = document.getElementById('errorMessage');
    errorText = document.getElementById('errorText');
    postsContainer = document.getElementById('postsContainer');
    mediumPosts = document.getElementById('mediumPosts');
    blogspotPosts = document.getElementById('blogspotPosts');
    mediumCount = document.getElementById('mediumCount');
    blogspotCount = document.getElementById('blogspotCount');
    searchInput = document.getElementById('searchInput');
    searchButton = document.getElementById('searchButton');
    searchResults = document.getElementById('searchResults');
    resultsGrid = document.getElementById('resultsGrid');
    resultsTitle = document.getElementById('resultsTitle');
    clearSearch = document.getElementById('clearSearch');
    latestPost = document.getElementById('latestPost');
    latestPostCard = document.getElementById('latestPostCard');

    // Set up event listeners
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {handleSearch();}
    });
    clearSearch.addEventListener('click', handleClearSearch);

    // Load posts on startup
    fetchAndDisplayPosts();
});

// ============================================
// UTILITY FUNCTIONS - Text Cleaning
// ============================================

/**
 * Strips HTML tags from a string
 * @param {string} html - HTML string to clean
 * @returns {string} - Plain text without HTML tags
 */
function stripHtmlTags(html) {
    if (!html) {return '';}

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Get text content (automatically strips tags)
    return temp.textContent || temp.innerText || '';
}

/**
 * Decodes HTML entities like &nbsp;, &amp;, &lt;, etc.
 * @param {string} text - Text with HTML entities
 * @returns {string} - Decoded plain text
 */
function decodeHtmlEntities(text) {
    if (!text) {return '';}

    const temp = document.createElement('textarea');
    temp.innerHTML = text;
    return temp.value;
}

/**
 * Cleans and processes blog summary text:
 * - Strips HTML tags
 * - Decodes HTML entities
 * - Combines paragraphs with proper spacing
 * - Truncates to specified length
 * 
 * @param {string} rawContent - Raw HTML or text content
 * @param {number} maxLength - Maximum length for summary (default: 200)
 * @returns {string} - Clean, formatted summary
 */
function cleanAndTruncateSummary(rawContent, maxLength = MAX_SUMMARY_LENGTH) {
    if (!rawContent) {return 'No summary available.';}

    // Step 1: Strip HTML tags
    let cleaned = stripHtmlTags(rawContent);

    // Step 2: Decode HTML entities
    cleaned = decodeHtmlEntities(cleaned);

    // Step 3: Normalize whitespace
    cleaned = cleaned
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n+/g, ' ')  // Replace newlines with space
        .trim();

    // Step 4: Truncate if too long
    if (cleaned.length > maxLength) {
        // Find the last space before maxLength to avoid cutting words
        const truncated = cleaned.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');

        if (lastSpace > 0) {
            cleaned = `${truncated.substring(0, lastSpace)  }...`;
        } else {
            cleaned = `${truncated  }...`;
        }
    }

    return cleaned;
}

/**
 * Formats date to readable format (e.g., "Oct 26")
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    if (!dateString) {return 'Unknown date';}

    try {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
    }
}

// ============================================
// API FUNCTIONS - Fetch Data
// ============================================

/**
 * Fetches all blog posts from the backend API
 */
async function fetchAndDisplayPosts() {
    showLoading();
    hideError();

    try {
        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${API_BASE}/api/posts`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const posts = data.posts || [];

        if (posts.length === 0) {
            throw new Error('No posts found - the vault is empty');
        }

        // Separate posts by source
        const mediumPostsList = posts.filter(post =>
            (post.source || '').toLowerCase() === 'medium'
        );
        const blogspotPostsList = posts.filter(post =>
            (post.source || '').toLowerCase() === 'blogspot'
        );

        // Find and display the latest post from both sources
        const allPosts = [...mediumPostsList, ...blogspotPostsList];
        if (allPosts.length > 0) {
            const latestPostData = allPosts.reduce((latest, current) => {
                const latestDate = new Date(latest.published);
                const currentDate = new Date(current.published);
                return currentDate > latestDate ? current : latest;
            });

            displayLatestPost(latestPostData);
        }

        // Render posts in their respective columns
        renderPosts(mediumPostsList, mediumPosts, mediumCount);
        renderPosts(blogspotPostsList, blogspotPosts, blogspotCount);

        // Show loading screen for minimum 1.2 seconds for smooth UX
        setTimeout(() => {
            hideLoading();
            postsContainer.hidden = false;
        }, 1200);

    } catch (error) {
        console.error('❌ Failed to fetch posts:', error);

        let errorMsg = 'Failed to load blogs';
        if (error.name === 'AbortError') {
            errorMsg = 'Request timed out - the server is taking too long. Try refreshing the page.';
        } else if (error.message) {
            errorMsg = `${errorMsg}: ${error.message}`;
        }

        showError(`${errorMsg}. Please try refreshing the page.`);
        hideLoading();
    }
}

// ============================================
// RENDERING FUNCTIONS - Create DOM Elements
// ============================================

/**
 * Displays the latest post in a highlighted section
 * @param {Object} post - The latest post object
 */
function displayLatestPost(post) {
    const card = createPostCard(post);
    card.style.border = 'none';
    latestPostCard.innerHTML = '';
    latestPostCard.appendChild(card);
    latestPost.hidden = false;
}

/**
 * Renders a list of posts to a target container
 * @param {Array} posts - Array of post objects
 * @param {HTMLElement} container - Target DOM element
 * @param {HTMLElement} countBadge - Badge element to show count
 */
function renderPosts(posts, container, countBadge) {
    // Clear existing content
    container.innerHTML = '';

    // Update count badge
    countBadge.textContent = posts.length;

    // Show empty state if no posts
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">∅</div>
                <div class="empty-state-text">nothing here yet</div>
            </div>
        `;
        return;
    }

    // Create and append post cards
    posts.forEach(post => {
        const card = createPostCard(post);
        container.appendChild(card);
    });
}

/**
 * Creates a beautiful post card element
 * @param {Object} post - Post data object
 * @returns {HTMLElement} - Complete post card element
 */
function createPostCard(post) {
    // Create main card container
    const card = document.createElement('article');
    card.className = 'post-card';

    // Create meta section (date and source)
    const meta = document.createElement('div');
    meta.className = 'post-meta';

    const sourceBadge = document.createElement('span');
    sourceBadge.className = 'post-source-badge';
    sourceBadge.textContent = post.source || 'Unknown';

    const date = document.createElement('span');
    date.className = 'post-date';
    date.textContent = formatDate(post.published);

    meta.appendChild(sourceBadge);
    meta.appendChild(date);

    // Create title section
    const titleContainer = document.createElement('div');
    titleContainer.className = 'post-title';

    const titleLink = document.createElement('a');
    titleLink.href = post.link || '#';
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleLink.textContent = post.title || 'Untitled Post';

    titleContainer.appendChild(titleLink);

    // Create summary section with cleaned text
    const summary = document.createElement('div');
    summary.className = 'post-summary';

    // Use the cleaning function to process the summary
    const rawSummary = post.summary || post.content || '';
    summary.textContent = cleanAndTruncateSummary(rawSummary);

    // Create "Read More" link
    const readMore = document.createElement('a');
    readMore.className = 'read-more';
    readMore.href = post.link || '#';
    readMore.target = '_blank';
    readMore.rel = 'noopener noreferrer';
    readMore.textContent = 'Read More';

    // Assemble the card
    card.appendChild(meta);
    card.appendChild(titleContainer);
    card.appendChild(summary);
    card.appendChild(readMore);

    return card;
}

// ============================================
// SEARCH FUNCTIONALITY (Placeholder)
// ============================================

/**
 * Handles search button click
 */
async function handleSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a search query');
        return;
    }

    console.log('Starting search for:', query);
    console.log('API_BASE:', API_BASE);

    // Show search results section
    searchResults.hidden = false;
    postsContainer.hidden = true;
    latestPost.hidden = true;
    resultsTitle.textContent = `Searching for "${query}"...`;
    resultsGrid.innerHTML = '<div class="loading">searching through posts...</div>';

    try {
        const searchUrl = `${API_BASE}/api/search`;
        console.log('Fetching:', searchUrl);
        
        const response = await fetch(searchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        console.log('Search response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
            console.error('Search error response:', errorData);
            throw new Error(errorData.message || errorData.error || 'Search failed');
        }

        const data = await response.json();
        console.log('Search results received:', data);

        const results = data.results || [];

        resultsTitle.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
        resultsGrid.innerHTML = '';

        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>no matches found</h3>
                    <p>couldn't find anything for "${query}"</p>
                    <p style="font-size: 0.9rem; margin-top: 1rem;">try different keywords or browse all posts</p>
                </div>
            `;
        } else {
            results.forEach(post => {
                const card = createPostCard(post);
                resultsGrid.appendChild(card);
            });
        }

    } catch (error) {
        console.error('Search error:', error);
        resultsTitle.textContent = 'Search Error';
        resultsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>search hit a snag</h3>
                <p>${error.message || 'search is taking a nap right now'}</p>
                <button onclick="document.getElementById('clearSearch').click()" class="btn btn-secondary" style="margin-top: 1rem;">
                    back to posts
                </button>
            </div>
        `;
    }
}

/**
 * Clears search and returns to main view
 */
function handleClearSearch() {
    searchResults.hidden = true;
    postsContainer.hidden = false;
    latestPost.hidden = false;  // Show the latest post section again
    searchInput.value = '';
    resultsGrid.innerHTML = '';
    resultsTitle.textContent = '';
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

/**
 * Shows loading screen
 */
function showLoading() {
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        loadingScreen.style.opacity = '1';
        loadingScreen.hidden = false;
    }
    if (postsContainer) {
        postsContainer.hidden = true;
    }
    if (errorMessage) {
        errorMessage.hidden = true;
    }
}

/**
 * Hides loading screen immediately
 */
function hideLoading() {
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.hidden = true;
            loadingScreen.style.display = 'none';
        }, 300);
    }
}

/**
 * Shows error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.hidden = false;
    errorText.textContent = message;
    postsContainer.hidden = true;
}

/**
 * Hides error message
 */
function hideError() {
    errorMessage.hidden = true;
    errorText.textContent = '';
}

// ============================================
// END OF FILE
// ============================================
