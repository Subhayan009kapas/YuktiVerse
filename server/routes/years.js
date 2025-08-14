// routes/years.js



import express from 'express';
import {
  createYear,
  listYears,
  toggleImportantYear,
  renameYear,
  deleteYear,

  addSubject,
  toggleImportantSubject,
  listSubjects,
  renameSubject,
  deleteSubject,

  addChapter,
  listChapters,
  updateChapterImportant ,
  renameChapter,
  deleteChapter,

  getMaterialsByChapter
} from '../controllers/yearController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

// Year
router.post('/', createYear);
router.get('/', listYears);
router.patch('/:yearId', toggleImportantYear);
router.patch('/rename/:yearId', renameYear);
router.delete('/:id', deleteYear);

// Subject
router.post('/:yearId/subjects', addSubject);
router.get('/:yearId/subjects', listSubjects);
router.patch('/subjects/:subjectId', toggleImportantSubject);
router.patch('/subjects/rename/:subjectId', renameSubject);
router.delete('/subjects/:id', deleteSubject);

// Chapter
router.post('/subjects/:subjectId/chapters', addChapter);
router.get('/subjects/:subjectId/chapters', listChapters);
router.patch('/subjects/chapters/:chapterId', updateChapterImportant);
router.patch('/subjects/chapters/rename/:chapterId', renameChapter);
router.delete('/subjects/chapters/:id', deleteChapter);

// Resource
router.get('/:chapterId/materials', getMaterialsByChapter);


export default router;
