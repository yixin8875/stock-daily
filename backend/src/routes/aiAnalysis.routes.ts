import { Router } from 'express';
import { AIAnalysisController } from '../controllers/aiAnalysis.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/report', AIAnalysisController.getReport);
router.post('/config', AIAnalysisController.setConfig);

export default router;
