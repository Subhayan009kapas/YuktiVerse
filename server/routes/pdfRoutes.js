import express from 'express';
import multer from 'multer';
import { summarizePDF, generateMCQs } from '../controllers/pdfController.js';

const router = express.Router();
const upload = multer();

router.post('/summarize', upload.single('pdf'), summarizePDF);
router.post('/mcq', generateMCQs); // 👈 New route

export default router;
