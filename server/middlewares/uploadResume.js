// // middlewares/uploadResume.js
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // 1. Define storage properly
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, '../uploads/resume'));
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// // 2. Define fileFilter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['.pdf', '.docx'];
//   const ext = path.extname(file.originalname).toLowerCase();
//   allowedTypes.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and DOCX files are allowed'));
// };

// // 3. Create upload instance
// const upload = multer({ 
//   storage, 
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// export default upload;


import multer from 'multer';

// Use memory storage to work with buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});


export default upload;