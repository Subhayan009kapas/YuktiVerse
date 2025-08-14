// routes/handwrittenNotes.js
import express from 'express';
import upload from '../middlewares/multer.js';   // this uses diskStorage
// import multer from 'multer';
import { uploadNote, getHandWrittenNotes , renameNote ,  toggleImportantNote ,  deleteHandwrittenNote } from '../controllers/handwrittenNoteController.js';
import auth  from '../middlewares/auth.js';


const router = express.Router();

// POST /api/notes/upload
router.post('/upload', auth, upload.single('file'), uploadNote);

// GET /api/notes
router.get('/', auth, getHandWrittenNotes);

router.patch('/:noteId/rename',auth, renameNote);
router.patch('/:noteId/important', auth, toggleImportantNote);

router.delete('/:id', auth, deleteHandwrittenNote);

export default router;