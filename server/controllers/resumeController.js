// export const uploadResume = async (req, res) => {
//   try {
//     const { GoogleGenerativeAI } = await import("@google/generative-ai");
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//     const fs = await import("fs/promises");
//     const pdfParse = (await import("pdf-parse")).default;
//     const mammoth = await import("mammoth");
//     const path = await import("path");

//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const ext = path.extname(file.originalname).toLowerCase();
//     const filePath = file.path;

//     let extractedText = "";

//     if (ext === ".pdf") {
//       const dataBuffer = await fs.readFile(filePath);
//       const data = await pdfParse(dataBuffer);
//       extractedText = data.text;
//     } else if (ext === ".docx") {
//       const result = await mammoth.extractRawText({ path: filePath });
//       extractedText = result.value;
//     } else {
//       return res.status(400).json({ message: "Unsupported file format" });
//     }

//     // Prompt for Gemini
//     const prompt = `
// You are an expert resume analyzer.

// Analyze the following resume content and return a clean JSON object with the following fields:

// {
//   "strengths": [ "..." ],
//   "issues": [ "..." ],
//   "suggestions": [ "..." ],
//   "recommendedRoles": [ "..." ],
//   "scorecard": {
//     "clarity": 0-10,
//     "formatting": 0-10,
//     "relevance": 0-10,
//     "totalFitScore": 0-100
//   }
// }

// ONLY return valid JSON. No explanation, no code block.

// Resume Content:
// """
// ${extractedText}
// """`;

//     // Analyze with Gemini
//     const model = genAI.getGenerativeModel({
//       model: "models/gemini-1.5-flash",
//     });

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     let text = await response.text();

//     // Clean & parse the response (handle ```json and ``` cases)
//     text = text.replace(/```json|```/g, "").trim();

//     let parsedJson;
//     try {
//       parsedJson = JSON.parse(text);
//     } catch (parseErr) {
//       console.error("❌ Failed to parse Gemini JSON:", parseErr);
//       return res.status(500).json({
//         message: "Gemini returned an invalid JSON",
//         error: parseErr.message,
//         raw: text,
//       });
//     }

//     // Send structured data back to frontend
//     return res.status(200).json(parsedJson);
//   } catch (err) {
//     console.error("❌ Resume processing error:", err);
//     return res.status(500).json({
//       message: "Server error while uploading or analyzing resume",
//       error: err.message,
//     });
//   }
// };

// // save to cloud 








// // for fetch all the resumes 


// import Resume from '../models/Resume.js';
// import { v2 as cloudinary } from 'cloudinary';

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// export const uploadResume = async (req, res) => {
//   try {
//     const { GoogleGenerativeAI } = await import("@google/generative-ai");
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
//     const pdfParse = (await import("pdf-parse")).default;
//     const mammoth = await import("mammoth");
//     const path = await import("path");

//     const file = req.file;
//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const ext = path.extname(file.originalname).toLowerCase();
//     let extractedText = "";

//     // Use buffer directly (no need for file system)
//     if (ext === ".pdf") {
//       const data = await pdfParse(file.buffer);
//       extractedText = data.text;
//     } else if (ext === ".docx") {
//       const result = await mammoth.extractRawText({ buffer: file.buffer });
//       extractedText = result.value;
//     } else {
//       return res.status(400).json({ message: "Unsupported file format" });
//     }

//     // Upload to Cloudinary
//    // In your controller:
// const cloudinaryResult = await new Promise((resolve) => {
//   const stream = cloudinary.uploader.upload_stream(
//     { 
//       resource_type: 'auto', 
//       folder: 'resumes',
//       // Add format preservation for PDFs
//       format: 'pdf',
//       type: 'upload'
//     },
//     (error, result) => {
//       if (error) {
//         console.error('❌ Cloudinary error:', error);
//         resolve(null);
//       } else {
//         resolve(result);
//       }
//     }
//   );
  
//   // Convert buffer to stream properly
//   const bufferStream = new stream.PassThrough();
//   bufferStream.end(file.buffer);
//   bufferStream.pipe(stream);
// });

//     // Gemini Analysis
//     const prompt = `
// You are an expert resume analyzer.

// Analyze the following resume content and return a clean JSON object with the following fields:

// {
//   "strengths": [ "..." ],
//   "issues": [ "..." ],
//   "suggestions": [ "..." ],
//   "recommendedRoles": [ "..." ],
//   "scorecard": {
//     "clarity": 0-10,
//     "formatting": 0-10,
//     "relevance": 0-10,
//     "totalFitScore": 0-100
//   }
// }

// ONLY return valid JSON. No explanation, no code block.

// Resume Content:
// """
// ${extractedText}
// """`;
    
//     const model = genAI.getGenerativeModel({
//       model: "models/gemini-1.5-flash",
//     });

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     let text = await response.text();

//     // Clean & parse response
//     text = text.replace(/```json|```/g, "").trim();
//     let parsedJson;
//     try {
//       parsedJson = JSON.parse(text);
//     } catch (parseErr) {
//       console.error("❌ Failed to parse Gemini JSON:", parseErr);
//       return res.status(500).json({
//         message: "Gemini returned an invalid JSON",
//         error: parseErr.message,
//         raw: text,
//       });
//     }

//     // Save to MongoDB
//     const newResume = new Resume({
//       filename: file.originalname,
//       cloudinaryUrl: cloudinaryResult?.secure_url || "",
//       analysisResult: parsedJson
//     });
    
//     await newResume.save();

//     return res.status(200).json({
//       analysis: parsedJson,
//       cloudinaryUrl: cloudinaryResult?.secure_url || "Upload failed but analysis completed"
//     });
    
//   } catch (err) {
//     console.error("❌ Resume processing error:", err);
//     return res.status(500).json({
//       message: "Server error while uploading or analyzing resume",
//       error: err.message,
//     });
//   }
// };









//exprimentnal  

import { v2 as cloudinary } from 'cloudinary';
import Resume from '../models/Resume.js';
import { PassThrough } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const saveResumeToDB = async (req, res) => {
  try {
    const path = await import("path");

    const file = req.file;
    const { analysis } = req.body;

    // Validate inputs
    if (!file || !analysis) {
      return res.status(400).json({ message: "Missing resume file or analysis" });
    }

    // ✅ Parse analysis from string to JSON object
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON in analysis", error: err.message });
    }

    const ext = path.extname(file.originalname).toLowerCase();

    // ✅ Upload to Cloudinary
    const cloudinaryUpload = await new Promise((resolve) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'resumes',
          format: ext === ".pdf" ? 'pdf' : undefined,
          type: 'upload'
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            resolve(null);
          } else {
            resolve(result);
          }
        }
      );

      const bufferStream = new PassThrough();
      bufferStream.end(file.buffer);
      bufferStream.pipe(stream);
    });

    // ✅ Save to MongoDB
    const newResume = new Resume({
      filename: file.originalname,
      cloudinaryUrl: cloudinaryUpload?.secure_url || "",
      analysisResult: parsedAnalysis,  // ✅ Save as proper object
    });

    await newResume.save();

    return res.status(200).json({
      message: "Resume saved successfully",
      analysis: parsedAnalysis,
      cloudinaryUrl: cloudinaryUpload?.secure_url || "Upload failed",
    });

  } catch (err) {
    console.error("❌ Save resume error:", err);
    return res.status(500).json({
      message: "Server error while saving resume",
      error: err.message,
    });
  }
};


// fetch all resume  from backend
// In resumeController.js

const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.status(200).json({ resumes });
  } catch (err) {
    res.status(500).json({ message: "Error fetching resumes", error: err });
  }
};

// Export using ES module style
export { getAllResumes };


// delete 

const deleteResume = async (req, res) => {
  try {
    const deleted = await Resume.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

export {  deleteResume };



