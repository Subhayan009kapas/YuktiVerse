import express from 'express';
import multer from 'multer';
import { summarizePDF, generateMCQs, getAllPDFHistory, deletePdfById } from '../controllers/pdfController.js';
import { savePdfAllData } from '../controllers/savePdfAllData.js';
import auth from '../middlewares/auth.js'; // ✅ Import authentication middleware

const router = express.Router();
const upload = multer();

// ✅ Protected routes — user must be logged in
router.post('/summarize', auth, upload.single('pdf'), summarizePDF);
router.post('/mcq', auth, generateMCQs);

// ✅ Save all PDF data linked to logged-in user
router.post('/save-all', upload.single('pdf'), auth, savePdfAllData);



// ✅ Get only the logged-in user's history
router.get('/history', auth, getAllPDFHistory);

// ✅ Delete only if it belongs to the logged-in user
router.delete('/delete/:id', auth, deletePdfById);

export default router;
