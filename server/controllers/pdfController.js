import pdfParse from 'pdf-parse';
import { getGeminiResponse } from '../utils/geminiClient.js';

export const summarizePDF = async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;  // ✅ From uploaded file
    const data = await pdfParse(pdfBuffer);  // ✅ Parses text from buffer
    const text = data.text;

    const prompt = `Summarize the following content:\n\n${text}`;
    const summary = await getGeminiResponse(prompt);

    res.json({ summary });
  } catch (error) {
    console.error('PDF Summary Error:', error.message);
    res.status(500).json({ error: 'Failed to summarize PDF' });
  }
};


// mcg genteretor
export const generateMCQs = async (req, res) => {
  try {
    const { summaryText } = req.body;

    if (!summaryText) {
      return res.status(400).json({ error: 'Summary text is required' });
    }

    const prompt = `
      Generate 5 multiple choice questions with 4 options each based on the following content. 
      Mark the correct answer clearly using "Answer: <correct option letter>".

      Content:
      ${summaryText}
    `;

    const mcqText = await getGeminiResponse(prompt);
    res.json({ mcqs: mcqText });
  } catch (error) {
    console.error('MCQ Generation Error:', error.message);
    res.status(500).json({ error: 'Failed to generate MCQs' });
  }
};
