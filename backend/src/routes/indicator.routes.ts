import { Router } from 'express';
import { IndicatorController } from '../controllers/indicator.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

// 计算所有技术指标
router.post('/calculate', IndicatorController.calculate);

// 单独计算各指标
router.post('/macd', IndicatorController.calcMACD);
router.post('/kdj', IndicatorController.calcKDJ);
router.post('/rsi', IndicatorController.calcRSI);
router.post('/ma', IndicatorController.calcMA);
router.post('/boll', IndicatorController.calcBOLL);

export default router;
