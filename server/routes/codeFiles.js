// import express from 'express';
// import { createCodeFile,getCodeFileById ,updateCodeFile,deleteCodeFile ,renameCodeFile ,toggleImportant,shareCodeFile} from '../../controllers/codefile/codeFileController.js';
// import authMiddleware from '../../middlewares/authMiddleware.js';

// const router = express.Router();

// router.post('/', authMiddleware, createCodeFile);
// router.get('/:_id', authMiddleware, getCodeFileById);
// router.put('/:id', authMiddleware, updateCodeFile);
// router.delete('/:id', authMiddleware, deleteCodeFile);
// router.patch('/:id/rename', authMiddleware, renameCodeFile);
// router.patch('/:id/important', authMiddleware, toggleImportant);
// router.post('/:id/share', authMiddleware, shareCodeFile);
// // router.get('/chapter/:chapterId', authMiddleware, getCodeFilesByChapter);
// // router.get('/search/query', authMiddleware, CodeFileController.searchCodeFiles);
// // router.get('/user/:userId/shared', authMiddleware, CodeFileController.getUserSharedCodeFiles);

// export default router;



 import express from 'express';
 const router = express.Router();
import {
  createCodeFile,
  getCodeFileById,
  getAllCodeFiles,
  updateCodeFile,
  deleteCodeFile,
  renameCodeFile,
  toggleImportant,
  shareCodeFile,
  getSharedCodeFile,
  forkCodeFile,
  searchCodeFiles,
  runCode,
  
}  from '../controllers/codeFileController.js';
 import auth from '../middlewares/auth.js';
import { generateCodingQuestion, verifyCode } from '../controllers/codingContestController.js';

// Public routes
router.get('/shared/:shareUrl', getSharedCodeFile);

// Protected routes
router.use(auth);

// CRUD operations
router.post('/', createCodeFile);
router.get('/', getAllCodeFiles);
router.get('/:id', getCodeFileById);
router.put('/:id', updateCodeFile);
router.delete('/:fileId', deleteCodeFile);
router.post('/run', runCode);

// Specific actions
router.patch('/:fileId/rename', renameCodeFile);
router.patch('/:fileId/important', toggleImportant);
router.post('/:id/share', shareCodeFile);
router.post('/:id/fork', forkCodeFile);


router.post("/coding", generateCodingQuestion);
router.post("/verify-code", verifyCode);

// Search
router.get('/search/:query', searchCodeFiles);

export default router;