// import mongoose from 'mongoose';

// const MCQSchema = new mongoose.Schema({
//   pdfDocument: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'PDFDocument',
//     required: true,
//   },
//   question: String,
//   options: [String],
//   answer: String,
// });

// const MCQ = mongoose.model('MCQ', MCQSchema);
// export default MCQ;


// MCQ.js
// MCQ.js
import mongoose from 'mongoose';

const MCQSchema = new mongoose.Schema({
  user: { // renamed from userId for consistency
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pdfDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDFDocument',
    required: true,
  },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true },
});

// ✅ Indexes
MCQSchema.index({ user: 1 });
MCQSchema.index({ pdfDocument: 1 });

const MCQ = mongoose.model('MCQ', MCQSchema);
export default MCQ;
