// // routes/resumeRoutes.js

// import express from 'express';
// import upload from '../middlewares/uploadResume.js';
// import { analyzeResume } from '../controllers/resumeAnalyzeController.js';
// import { deleteResume, getAllResumes, saveResumeToDB } from '../controllers/resumeController.js';

// const router = express.Router();

// router.post('/analyze', upload.single('resume'), analyzeResume);
// router.post('/save', upload.single('resume'), saveResumeToDB);

// router.get("/all", getAllResumes);

// // for deelete
// router.delete("/delete/:id", deleteResume);

// export default router;


// routes/resumeRoutes.js
import express from 'express';
import upload from '../middlewares/uploadResume.js';
import { analyzeResume } from '../controllers/resumeAnalyzeController.js';
import { deleteResume, getAllResumes, saveResumeToDB } from '../controllers/resumeController.js';
import auth from '../middlewares/auth.js'; // ✅ Add auth middleware

const router = express.Router();

// Analyze resume (no saving, just AI output) — still requires auth
router.post('/analyze', auth, upload.single('resume'), analyzeResume);

// Save resume to DB with file upload — requires auth
router.post('/save', auth, upload.single('resume'), saveResumeToDB);

// Get all resumes for the logged-in user
router.get('/all', auth, getAllResumes);

// Delete resume by ID — requires auth
router.delete('/delete/:id', auth, deleteResume);

export default router;
