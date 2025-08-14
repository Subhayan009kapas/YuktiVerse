// // summarizePDF.js
// import pdfParse from 'pdf-parse';
// import { getGeminiResponse } from '../utils/geminiClient.js';

// export const summarizePDF = async (req, res) => {
//   try {
//     const pdfBuffer = req.file.buffer;
//     const data = await pdfParse(pdfBuffer);
//     const text = data.text;

//     const prompt = `
// You are an AI summarizer designed to help users understand documents quickly in a frontend UI with collapsible accordions.

// Analyze the following PDF content and generate a **clean, structured summary**. Break the content into **distinct key points**, where:

// - Each key point will be shown as a clickable accordion section in the UI.
// - The **title** represents the topic heading.
// - The **content** is a clear, 2–4 sentence explanation of the topic.
// - (Optional) Include a "tags" field with relevant keywords if the topic fits clearly into known categories (e.g., ["SQL", "Database"]).

// ### Output Format (JSON only):
// [
//   {
//     "title": "Topic Title",
//     "content": "Clear explanation here...",
//     "tags": ["optional", "keywords"]
//   },
//   ...
// ]

// Instructions:
// - Use a teaching tone that's clear, compact, and user-friendly.
// - Group and name each key idea clearly.
// - Do not include markdown or code block syntax (no backticks).
// - If the document is very long, limit to the **top 20–25 most informative points**.

// ### PDF Content:
// ${text}
// `;


//     const summary = await getGeminiResponse(prompt);

//     res.json({ summary });
//   } catch (error) {
//     console.error('PDF Summary Error:', error.message);
//     res.status(500).json({ error: 'Failed to summarize PDF' });
//   }
// };


// // mcg genteretor
// // generateMCQs.js


// export const generateMCQs = async (req, res) => {
//   try {
//     const { summaryText } = req.body;

//     if (!summaryText) {
//       return res.status(400).json({ error: 'Summary text is required' });
//     }

//     const prompt = `
// You are a test generator AI. Based only on the following summary, create 5 multiple choice questions.

// IMPORTANT: Format each question exactly as follows:

// Q1. [Your question here]
// A. [Option A]
// B. [Option B]
// C. [Option C]
// D. [Option D]
// Answer: [A/B/C/D]

// Q2. [Your question here]
// A. [Option A]
// B. [Option B]
// C. [Option C]
// D. [Option D]
// Answer: [A/B/C/D]

// Continue this format for all 5 questions. Make sure each question has exactly 4 options labeled A, B, C, and D, and mark the correct answer clearly using "Answer: [letter]".

// Summary:
// ${summaryText}
// `;

//     const mcqText = await getGeminiResponse(prompt);

//     res.json({ mcqs: mcqText }); // You could also parse this into JSON here
//   } catch (error) {
//     console.error('MCQ Generation Error:', error.message);
//     res.status(500).json({ error: 'Failed to generate MCQs' });
//   }
// };


// //get all datta from databse

// import PDFDocument from '../models/PDFDocument.js';
// import MCQ from '../models/MCQ.js';

// export const getAllPDFHistory = async (req, res) => {
//   try {
//     const pdfs = await PDFDocument.find().sort({ createdAt: -1 });

//     const fullData = await Promise.all(
//       pdfs.map(async (pdf) => {
//         const mcqs = await MCQ.find({ pdfDocument: pdf._id });
//         return {
//           _id: pdf._id,
//           title: pdf.title,
//           summary: pdf.summary,
//           cloudinaryUrl: pdf.cloudinaryUrl,
//           createdAt: pdf.createdAt,
//           mcqs,
//         };
//       })
//     );

//     res.status(200).json(fullData);
//   } catch (err) {
//     console.error('Error fetching PDF history:', err.message);
//     res.status(500).json({ error: 'Failed to fetch PDF history' });
//   }
// };

// // Delete PDF and its MCQs


// export const deletePdfById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Delete all related MCQs first
//     await MCQ.deleteMany({ pdfDocument: id });

//     // Delete the PDF document
//     await PDFDocument.findByIdAndDelete(id);

//     res.status(200).json({ message: 'PDF and related MCQs deleted successfully' });
//   } catch (error) {
//     console.error('Delete PDF Error:', error.message);
//     res.status(500).json({ error: 'Failed to delete PDF document' });
//   }
// };





// summarizePDF.js

import { getGeminiResponse } from '../utils/geminiClient.js';
import PDFDocument from '../models/PDFDocument.js';
import MCQ from '../models/MCQ.js';

// ✅ Summarize and link to user (optional saving logic can be added later if needed)
export const summarizePDF = async (req, res) => {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const prompt = `
You are an AI summarizer designed to help users understand documents quickly in a frontend UI with collapsible accordions.

Analyze the following PDF content and generate a **clean, structured summary**. Break the content into **distinct key points**, where:

- Each key point will be shown as a clickable accordion section in the UI.
- The **title** represents the topic heading.
- The **content** is a clear, 2–4 sentence explanation of the topic.
- (Optional) Include a "tags" field with relevant keywords if the topic fits clearly into known categories (e.g., ["SQL", "Database"]).

### Output Format (JSON only):
[
  {
    "title": "Topic Title",
    "content": "Clear explanation here...",
    "tags": ["optional", "keywords"]
  }
]

Instructions:
- Use a teaching tone that's clear, compact, and user-friendly.
- Group and name each key idea clearly.
- Do not include markdown or code block syntax (no backticks).
- If the document is very long, limit to the **top 20–25 most informative points**.

### PDF Content:
${text}
`;

    const summary = await getGeminiResponse(prompt);

    res.json({ summary });
  } catch (error) {
    console.error('PDF Summary Error:', error.message);
    res.status(500).json({ error: 'Failed to summarize PDF' });
  }
};

// ✅ Generate MCQs (No change — but protected by auth in routes)
export const generateMCQs = async (req, res) => {
  try {
    const { summaryText } = req.body;

    if (!summaryText) {
      return res.status(400).json({ error: 'Summary text is required' });
    }

    const prompt = `
You are a test generator AI. Based only on the following summary, create 5 multiple choice questions.

IMPORTANT: Format each question exactly as follows:

Q1. [Your question here]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Answer: [A/B/C/D]

Q2. [Your question here]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Answer: [A/B/C/D]

Continue this format for all 5 questions. Make sure each question has exactly 4 options labeled A, B, C, and D, and mark the correct answer clearly using "Answer: [letter]".

Summary:
${summaryText}
`;

    const mcqText = await getGeminiResponse(prompt);

    res.json({ mcqs: mcqText }); // You could also parse this into JSON here
  } catch (error) {
    console.error('MCQ Generation Error:', error.message);
    res.status(500).json({ error: 'Failed to generate MCQs' });
  }
};


// ✅ Get only logged-in user's PDFs
export const getAllPDFHistory = async (req, res) => {
  try {
    const pdfs = await PDFDocument.find({ userId: req.user.id }).sort({ createdAt: -1 });


    const fullData = await Promise.all(
      pdfs.map(async (pdf) => {
        const mcqs = await MCQ.find({ pdfDocument: pdf._id });
        return {
          _id: pdf._id,
          title: pdf.title,
          summary: pdf.summary,
          cloudinaryUrl: pdf.cloudinaryUrl,
          createdAt: pdf.createdAt,
          mcqs,
        };
      })
    );

    res.status(200).json(fullData);
  } catch (err) {
    console.error('Error fetching PDF history:', err.message);
    res.status(500).json({ error: 'Failed to fetch PDF history' });
  }
};

// ✅ Delete only if PDF belongs to the logged-in user
export const deletePdfById = async (req, res) => {
  const { id } = req.params;

  try {
   const pdf = await PDFDocument.findOne({ _id: id, userId: req.user.id });

    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found or not authorized' });
    }

    await MCQ.deleteMany({ pdfDocument: id });
    await PDFDocument.findByIdAndDelete(id);

    res.status(200).json({ message: 'PDF and related MCQs deleted successfully' });
  } catch (error) {
    console.error('Delete PDF Error:', error.message);
    res.status(500).json({ error: 'Failed to delete PDF document' });
  }
};

