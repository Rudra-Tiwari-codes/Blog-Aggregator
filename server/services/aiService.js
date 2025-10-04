import OpenAI from 'openai';
import Blog from '../models/Blog.js';
import { stripHtmlTags } from './rssFetcher.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a summary for blog content using OpenAI
 * @param {string} content - Blog content (HTML or plain text)
 * @param {string} title - Blog title
 * @returns {Promise<string>} Generated summary
 */
export const generateSummary = async (content, title) => {
  try {
    const plainText = stripHtmlTags(content);
    const truncatedContent = plainText.substring(0, 4000); // Limit content length

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise, engaging 2-3 sentence summaries of blog posts. Focus on the main points and make it interesting for readers."
        },
        {
          role: "user",
          content: `Please summarize this blog post titled "${title}":\n\n${truncatedContent}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating summary:', error.message);
    // Return a fallback summary
    const plainText = stripHtmlTags(content);
    return plainText.substring(0, 200) + '...';
  }
};

/**
 * Generate embedding for blog content using OpenAI
 * @param {string} content - Blog content
 * @param {string} title - Blog title
 * @returns {Promise<Array>} Embedding vector
 */
export const generateEmbedding = async (content, title) => {
  try {
    const plainText = stripHtmlTags(content);
    const truncatedContent = plainText.substring(0, 8000);
    const textToEmbed = `${title}\n\n${truncatedContent}`;

    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: textToEmbed,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    return [];
  }
};

/**
 * Generate summaries for all blogs without summaries
 * @returns {Promise<Object>} Statistics of processed blogs
 */
export const generateSummariesForAllBlogs = async () => {
  try {
    const blogsWithoutSummary = await Blog.find({
      $or: [
        { summary: { $exists: false } },
        { summary: '' }
      ]
    }).limit(10); // Process in batches to avoid rate limits

    let processed = 0;
    let failed = 0;

    for (const blog of blogsWithoutSummary) {
      try {
        const summary = await generateSummary(blog.content, blog.title);
        blog.summary = summary;
        await blog.save();
        processed++;
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate summary for blog ${blog._id}:`, error.message);
        failed++;
      }
    }

    return { processed, failed, total: blogsWithoutSummary.length };
  } catch (error) {
    console.error('Error in generateSummariesForAllBlogs:', error.message);
    throw error;
  }
};

/**
 * Generate embeddings for all blogs without embeddings
 * @returns {Promise<Object>} Statistics of processed blogs
 */
export const generateEmbeddingsForAllBlogs = async () => {
  try {
    const blogsWithoutEmbedding = await Blog.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } }
      ]
    }).limit(10); // Process in batches

    let processed = 0;
    let failed = 0;

    for (const blog of blogsWithoutEmbedding) {
      try {
        const embedding = await generateEmbedding(blog.content, blog.title);
        blog.embedding = embedding;
        await blog.save();
        processed++;
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate embedding for blog ${blog._id}:`, error.message);
        failed++;
      }
    }

    return { processed, failed, total: blogsWithoutEmbedding.length };
  } catch (error) {
    console.error('Error in generateEmbeddingsForAllBlogs:', error.message);
    throw error;
  }
};

/**
 * Find related blogs using cosine similarity of embeddings
 * @param {string} blogId - ID of the blog to find related posts for
 * @param {number} limit - Number of related blogs to return
 * @returns {Promise<Array>} Array of related blog objects
 */
export const findRelatedBlogs = async (blogId, limit = 5) => {
  try {
    const blog = await Blog.findById(blogId);
    
    if (!blog || !blog.embedding || blog.embedding.length === 0) {
      // Fallback to category-based recommendations
      return await Blog.find({
        _id: { $ne: blogId },
        categories: { $in: blog.categories }
      })
      .sort({ publishDate: -1 })
      .limit(limit)
      .select('title author summary link source publishDate imageUrl');
    }

    // Get all blogs with embeddings
    const allBlogs = await Blog.find({
      _id: { $ne: blogId },
      embedding: { $exists: true, $ne: [] }
    });

    // Calculate cosine similarity
    const similarities = allBlogs.map(otherBlog => {
      const similarity = cosineSimilarity(blog.embedding, otherBlog.embedding);
      return { blog: otherBlog, similarity };
    });

    // Sort by similarity and return top results
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, limit).map(item => ({
      _id: item.blog._id,
      title: item.blog.title,
      author: item.blog.author,
      summary: item.blog.summary,
      link: item.blog.link,
      source: item.blog.source,
      publishDate: item.blog.publishDate,
      imageUrl: item.blog.imageUrl,
      similarity: item.similarity
    }));
  } catch (error) {
    console.error('Error finding related blogs:', error.message);
    return [];
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} Cosine similarity score
 */
const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
};
