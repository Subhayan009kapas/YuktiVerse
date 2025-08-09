// controllers/resumeAnalyzeController.js
export const analyzeResume = async (req, res) => {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const pdfParse = (await import("pdf-parse")).default;
    const mammoth = await import("mammoth");
    const path = await import("path");

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const ext = path.extname(file.originalname).toLowerCase();
    let extractedText = "";

    if (ext === ".pdf") {
      const data = await pdfParse(file.buffer);
      extractedText = data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } else {
      return res.status(400).json({ message: "Unsupported file format" });
    }

    const prompt = `
You are an expert resume analyzer.

Analyze the following resume content and return a clean JSON object with the following fields:

{
  "strengths": [ "..." ],
  "issues": [ "..." ],
  "suggestions": [ "..." ],
  "recommendedRoles": [ "..." ],
  "scorecard": {
    "clarity": 0-10,
    "formatting": 0-10,
    "relevance": 0-10,
    "totalFitScore": 0-100
  }
}

ONLY return valid JSON. No explanation, no code block.

Resume Content:
"""
${extractedText}
"""`;

    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = await response.text();

    text = text.replace(/```json|```/g, "").trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
    } catch (parseErr) {
      return res.status(500).json({
        message: "Gemini returned invalid JSON",
        error: parseErr.message,
        raw: text,
      });
    }

    // 👇 Return buffer as base64 string so frontend can reuse it for /save
    return res.status(200).json({
      message: "Analysis complete",
      analysis: parsedJson,
      userId: req.user._id,
      fileInfo: {
        filename: file.originalname,
        buffer: file.buffer.toString('base64'),
        mimetype: file.mimetype
      }
    });
  } catch (err) {
    console.error("❌ Error during analysis:", err);
    return res.status(500).json({
      message: "Analysis failed",
      error: err.message
    });
  }
};
