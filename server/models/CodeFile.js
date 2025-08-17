// models/CodeFile.js - Mongoose Model
// =============================================

import mongoose  from  'mongoose';

const codeFileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  content: {
    type: String,
    // required: true,
    default: ''
  },
  prog_language: {
    type: String,
    required: true,
    enum: [
      'javascript', 'python', 'java', 'cpp', 'c', 'html', 'css', 
      'react', 'typescript', 'php', 'ruby', 'go', 'rust', 'kotlin', 
      'swift', 'sql', 'json', 'xml', 'markdown', 'other'
    ],
    default: 'javascript'
  },
  description: {
    type: String,
    maxLength: 2000,
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: 50
  }],
  important: {
    type: Boolean,
    default: false
  },
  isShared: {
    type: Boolean,
    default: false
  },
  shareUrl: {
    type: String,
    unique: true,
    sparse: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  version: {
    type: Number,
    default: 1
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  forkOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeFile'
  },
  forkCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
codeFileSchema.index({ userId: 1, createdAt: -1 });
codeFileSchema.index({ shareUrl: 1 });
codeFileSchema.index({ tags: 1 });
codeFileSchema.index({ prog_language: 1 });
codeFileSchema.index({ important: 1, userId: 1 });

// Virtual for formatted dates
codeFileSchema.virtual('lastModified').get(function() {
  return this.updatedAt;
});

// Pre-save middleware to increment version
codeFileSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Generate share URL
codeFileSchema.methods.generateShareUrl = function() {
  const crypto = require('crypto');
  this.shareUrl = crypto.randomBytes(16).toString('hex');
  this.isShared = true;
  return this.shareUrl;
};

export default mongoose.model('CodeFile', codeFileSchema);