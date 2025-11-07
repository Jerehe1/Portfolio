import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
 
  repoName: {
    type: String,
    required: true,
    unique: true
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  customDescription: {
    type: String,
    default: null
  },
  customImage: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  hidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Project', projectSchema);
