// models/HandwrittenNote.js
import mongoose from 'mongoose';

const HandwrittenNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  title: {
    type: String,
    trim: true,
    default: 'Untitled Note',
  },
  fileType: {
    type: String,
    enum: ['image', 'pdf'],
    // required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
   important :{
    type : Boolean , 
    default : false,
  },
  cloudinaryPublicId: { type: String } , 
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Automatically update `updatedAt`
HandwrittenNoteSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// export default mongoose.model('HandwrittenNote', HandwrittenNoteSchema);
export default mongoose.models.HandwrittenNote || mongoose.model('HandwrittenNote', HandwrittenNoteSchema);

