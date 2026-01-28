import { Router } from 'express';
import { TradingDashboardController } from '../controllers/tradingDashboard.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/metrics', TradingDashboardController.getMetrics);
router.get('/drawdown', TradingDashboardController.getDrawdownCurve);
router.get('/streaks', TradingDashboardController.getStreakHistory);

export default router;
