import mongoose from 'mongoose';

const PDFDocumentSchema = new mongoose.Schema({
  title: String,
  summary: String,
  cloudinaryUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PDFDocument = mongoose.model('PDFDocument', PDFDocumentSchema);
export default PDFDocument;
