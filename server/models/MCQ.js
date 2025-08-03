import mongoose from 'mongoose';

const MCQSchema = new mongoose.Schema({
  pdfDocument: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDFDocument',
    required: true,
  },
  question: String,
  options: [String],
  answer: String,
});

const MCQ = mongoose.model('MCQ', MCQSchema);
export default MCQ;
