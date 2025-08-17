import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import handwrittenNotesRoutes from "./routes/handwrittenNotes.js";

import notebooksRoutes from "./routes/notebooks.js";
import yearRoutes from "./routes/years.js";

import shareRoutes from "./routes/shareroute.js";
import geminiRoutes from "./routes/gemini.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

//checking server
app.get("/", (req, res) => res.send("YuktiVerse Backend Running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});

// for gemini Reponse
import { getGeminiResponse } from "./utils/geminiClient.js";

app.get("/test-gemini", async (req, res) => {
  const result = await getGeminiResponse("how india ");
  res.send(result);
});

import authRoutes from "./routes/auth.js";
app.use("/api/auth", authRoutes);

// routes for pdf summrizer
import pdfRoutes from "./routes/pdfRoutes.js";

app.use("/api/pdf", pdfRoutes);

// resume analysis

// const resumeRoutes = require('./routes/resumeRoutes');
import resumeRoutes from "./routes/resumeRoutes.js";

app.use("/api/resume", resumeRoutes);

import testRoutes from "./routes/testRoutes.js"; // <-- Path must be correct


// ... after app = express()
app.use("/api", testRoutes);

// handwritten notes
app.use("/api/handwritten-notes", handwrittenNotesRoutes);

// ai notes
app.use("/api/notebooks", notebooksRoutes);

// year dosument getting
app.use("/years", yearRoutes); // post: api/years

// share routes ()
app.use("/api/share", shareRoutes);

// genini routes
app.use("/api/ai-help", geminiRoutes);

// import codingContestRoutes from "./routes/codingContest.js";
// app.use("/api/codefiles", codingContestRoutes);

import codeFiles from "./routes/codeFiles.js";
app.use("/api/codefiles" ,codeFiles );

