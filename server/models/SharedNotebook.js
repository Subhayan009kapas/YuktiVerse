import mongoose  from 'mongoose';

const sharedNotebookSchema = new mongoose.Schema({
  shareId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  notebookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notebook',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    // enum: ['pdf', 'docx', 'txt', 'md', 'html', 'json'],
    required: true
  },
  
  title:{
    type: String,
    required  : true ,
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastViewedAt: {
    type: Date
  },
  revokedAt: {
    type: Date
  }
});

// Index for efficient queries
sharedNotebookSchema.index({ shareId: 1, isActive: 1 });
sharedNotebookSchema.index({ userId: 1, isActive: 1 });
sharedNotebookSchema.index({ notebookId: 1 });

// Virtual for share URL (if needed)
sharedNotebookSchema.virtual('shareUrl').get(function() {
  return `${process.env.FRONTEND_URL}/api/share/notebook/${this.shareId}`;
});

export default mongoose.model('SharedNotebook', sharedNotebookSchema);