import { Router } from 'express';
import { CorrelationController } from '../controllers/correlation.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/correlations', CorrelationController.getCorrelations);
router.get('/diversification', CorrelationController.getDiversification);

export default router;
