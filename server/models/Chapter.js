import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  important: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Chapter', ChapterSchema);