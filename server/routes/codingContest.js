// routes/codingContest.js
import express from "express";
import { generateCodingQuestion, verifyCode } from "../controllers/codingContestController.js";
import auth from '../middlewares/auth.js';
const router = express.Router();

// Route to generate a coding question
router.post("/coding",auth , generateCodingQuestion);
router.post("/verify-code",auth , verifyCode);
export default router;
