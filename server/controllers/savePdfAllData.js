// import cloudinary from 'cloudinary';
// import dotenv from 'dotenv';
// import PDFDocument from '../models/PDFDocument.js';
// import MCQ from '../models/MCQ.js';

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export const savePdfAllData = async (req, res) => {
//   try {
//     const { summaryText, mcqs } = req.body;
//     const parsedMCQs = JSON.parse(mcqs);
//     const fileBuffer = req.file.buffer;
//     const fileName = req.file.originalname;

//     if (!summaryText || !parsedMCQs || !fileBuffer) {
//       return res.status(400).json({ error: 'Missing required data' });
//     }

//     // Upload PDF to Cloudinary
//     const uploadResult = await new Promise((resolve, reject) => {
//       cloudinary.v2.uploader.upload_stream(
//         { resource_type: 'raw', public_id: `pdfs/${fileName}` },
//         (err, result) => (err ? reject(err) : resolve(result))
//       ).end(fileBuffer);
//     });

//     // Save PDF Document
//     const pdfDoc = new PDFDocument({
//       title: fileName,
//       summary: summaryText,
//       cloudinaryUrl: uploadResult.secure_url,
//     });
//     await pdfDoc.save();

//     // Save MCQs
//     const mcqDocs = parsedMCQs.map((mcq) => ({
//       pdfDocument: pdfDoc._id,
//       question: mcq.question,
//       options: mcq.options,
//       answer: mcq.answer,
//     }));

//     await MCQ.insertMany(mcqDocs);

//     res.status(201).json({
//       message: 'All data saved successfully',
//       pdfId: pdfDoc._id,
//     });
//   } catch (error) {
//     console.error('Save All Error:', error.message);
//     res.status(500).json({ error: 'Failed to save all data' });
//   }
// };


import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import PDFDocument from '../models/PDFDocument.js';
import MCQ from '../models/MCQ.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const savePdfAllData = async (req, res) => {
  try {
    const { summaryText, mcqs } = req.body;
    const parsedMCQs = JSON.parse(mcqs);
    const fileBuffer = req.file?.buffer;
    const fileName = req.file?.originalname;

    if (!summaryText || !parsedMCQs || !fileBuffer) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // ✅ Support both _id and id in token payload
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { resource_type: 'raw', public_id: `pdfs/${Date.now()}_${fileName}` },
        (err, result) => (err ? reject(err) : resolve(result))
      ).end(fileBuffer);
    });

    const pdfDoc = new PDFDocument({
      userId: userId, // ✅ use fallback-safe variable
      title: fileName,
      summary: summaryText,
      cloudinaryUrl: uploadResult.secure_url,
    });
    await pdfDoc.save();

    const mcqDocs = parsedMCQs.map((mcq) => ({
      user: userId, // ✅ use fallback-safe variable
      pdfDocument: pdfDoc._id,
      question: mcq.question,
      options: mcq.options,
      answer: mcq.answer,
    }));

    await MCQ.insertMany(mcqDocs);

    res.status(201).json({
      message: 'All data saved successfully',
      pdfId: pdfDoc._id,
    });
  } catch (error) {
    console.error('Save All Error:', error);
    res.status(500).json({ error: 'Failed to save all data' });
  }
};
