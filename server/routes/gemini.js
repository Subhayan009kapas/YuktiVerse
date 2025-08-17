import express from 'express';
import { askCode, mcqGen, resumeAnalysis, shortExplain, detailedExplain, simpleChat, askCodeCorrection, askCodeOptimization, askCodeExplain, askCodeImprove, askCodeGeneration } from '../controllers/geminiController.js';

const router = express.Router();

router.post('/ask-code', askCode);
router.post('/mcq-gen', mcqGen);
router.post('/resume-analysis', resumeAnalysis);
router.post('/short-explain', shortExplain);
router.post('/detailed-explain', detailedExplain);
router.post('/simple-chat', simpleChat);


router.post('/correction', askCodeCorrection);
router.post('/optimize', askCodeOptimization);
router.post('/explain', askCodeExplain);
// router.post('/improve', getAiHelp);
router.post('/improve',  askCodeImprove);
router.post('/generate',askCodeGeneration );

export default router;
    