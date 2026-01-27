import { Router } from 'express';
import { BacktestController } from '../controllers/backtest.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

/**
 * @route   GET /api/backtest
 * @desc    Run strategy backtest
 * @query   strategyType - Strategy type (all/trend/swing/value)
 * @query   startDate - Start date (optional)
 * @query   endDate - End date (optional)
 * @access  Private
 */
router.get('/', BacktestController.runBacktest);

export default router;
