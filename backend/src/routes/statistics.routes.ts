import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All statistics routes require authentication
router.use(authMiddleware);

// Get statistics summary (win rate, profit/loss ratio, etc.)
router.get('/summary', StatisticsController.getSummary);

// Get profit curve data (by day/week/month)
router.get('/profit', StatisticsController.getProfitCurve);

// Get trade statistics (trade counts, distribution, etc.)
router.get('/trades', StatisticsController.getTradeStatistics);

// Get monthly profit data
router.get('/monthly', StatisticsController.getMonthlyProfit);

// Get win rate trend data
router.get('/win-rate-trend', StatisticsController.getWinRateTrend);

// Get emotion vs profit analysis
router.get('/emotion-analysis', StatisticsController.getEmotionProfitAnalysis);

export default router;
