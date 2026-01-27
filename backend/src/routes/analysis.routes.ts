import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All analysis routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/analysis
 * @desc    Get AI analysis results
 * @access  Private
 */
router.get('/', AnalysisController.getAnalysis);

export default router;
