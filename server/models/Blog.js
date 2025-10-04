import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    type: String,
    enum: ['medium', 'blogger'],
    required: true
  },
  publishDate: {
    type: Date,
    required: true
  },
  categories: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  imageUrl: {
    type: String,
    default: ''
  },
  embedding: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

// Index for faster queries
blogSchema.index({ publishDate: -1 });
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ categories: 1 });
blogSchema.index({ source: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
