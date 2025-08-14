import express from 'express';
import auth from '../middlewares/auth.js';
import { createNotebook, getNotebookById, updateNotebook , renameNotebook  , toggleImportantNotebook , deleteNotebook} from '../controllers/notebookController.js';

const router = express.Router();

// POST /api/notebooks
router.post('/', auth, createNotebook);   // http://localhost:3000/api/notebooks/
// router.post('/', createNotebook);


router.get('/:id', auth, getNotebookById);  // http://localhost:3000/api/notebooks/math-note-4

router.put('/:id', auth, updateNotebook);   // http://localhost:3000/api/notebooks/math-note-4

router.patch('/:noteId/rename', auth, renameNotebook);
router.patch('/:noteId/important', auth, toggleImportantNotebook);

router.delete('/:id', auth, deleteNotebook);
// GET  /api/notebooks
// router.get('/',  protect, getNotebooks);
// router.get('/', getNotebooks);


export default router;
