// routes/resumeRoutes.js

import express from 'express';
import upload from '../middlewares/uploadResume.js';
import { analyzeResume } from '../controllers/resumeAnalyzeController.js';
import { deleteResume, getAllResumes, saveResumeToDB } from '../controllers/resumeController.js';

const router = express.Router();

router.post('/analyze', upload.single('resume'), analyzeResume);
router.post('/save', upload.single('resume'), saveResumeToDB);

router.get("/all", getAllResumes);

// for deelete
router.delete("/delete/:id", deleteResume);

export default router;
