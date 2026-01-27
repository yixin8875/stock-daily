import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/profit-curve', AnalysisController.getProfitCurve);
router.get('/reviews', AnalysisController.getTradeReviews);
router.get('/report', AnalysisController.generateReport);

export default router;
