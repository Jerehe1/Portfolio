import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }],
  published: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Blog', blogSchema);
