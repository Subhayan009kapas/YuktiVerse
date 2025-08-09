// import mongoose from 'mongoose';

// const PDFDocumentSchema = new mongoose.Schema({
//   title: String,
//   summary: String,
//   cloudinaryUrl: String,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const PDFDocument = mongoose.model('PDFDocument', PDFDocumentSchema);
// export default PDFDocument;

// PDFDocument.js
// PDFDocument.js
import mongoose from 'mongoose';

const PDFDocumentSchema = new mongoose.Schema({
  userId: { // renamed from userId for consistency
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  cloudinaryUrl: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Indexes
PDFDocumentSchema.index({ user: 1 });
PDFDocumentSchema.index({ createdAt: -1 });

const PDFDocument = mongoose.model('PDFDocument', PDFDocumentSchema);
export default PDFDocument;
