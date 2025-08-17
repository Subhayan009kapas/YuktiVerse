// routes/codingContest.js
import express from "express";
import { generateCodingQuestion, verifyCode } from "../controllers/codingContestController.js";
import auth from '../middlewares/auth.js';
const router = express.Router();

// Route to generate a coding question

export default router;
