import express from 'express';
import multer from 'multer';
import { summarizePDF, generateMCQs, getAllPDFHistory, deletePdfById } from '../controllers/pdfController.js';

import { savePdfAllData } from '../controllers/savePdfAllData.js';
const router = express.Router();
const upload = multer();

// Existing routes
router.post('/summarize', upload.single('pdf'), summarizePDF);
router.post('/mcq', generateMCQs);


// New route to save all PDF data
router.post('/save-all', upload.single('pdf'), savePdfAllData);

// New route to get all PDF history
router.get('/history', getAllPDFHistory);

// delete route for PDF by ID
router.delete('/delete/:id', deletePdfById);

export default router;
