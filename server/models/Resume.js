// models/Resume.js
import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  filename: { 
    type: String,
    required: true 
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  analysisResult: {
    type: Object,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add indexes for better query performance
resumeSchema.index({ createdAt: -1 });
resumeSchema.index({ filename: 1 });

export default mongoose.model('Resume', resumeSchema);