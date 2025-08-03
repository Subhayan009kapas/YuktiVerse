// summarizePDF.js
import pdfParse from 'pdf-parse';
import { getGeminiResponse } from '../utils/geminiClient.js';

export const summarizePDF = async (req, res) => {
  try {
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
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
// generateMCQs.js


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
