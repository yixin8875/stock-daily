import { Router } from 'express';
import { body } from 'express-validator';
import {
  WatchStockController,
  BuyPlanController,
  SellPlanController,
  StopLossController,
} from '../controllers/plan.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All plan routes require authentication
router.use(authMiddleware);

// ==================== Watch Stock Routes ====================
// Get watch stocks by diary ID
router.get('/watch/:diaryId', WatchStockController.findByDiaryId);

// Create watch stock
router.post(
  '/watch',
  [
    body('diaryId').notEmpty().withMessage('Diary ID is required'),
    body('stockCode').notEmpty().withMessage('Stock code is required'),
    body('stockName').notEmpty().withMessage('Stock name is required'),
    body('watchLevel')
      .optional()
      .isIn(['HIGH', 'NORMAL', 'LOW'])
      .withMessage('Watch level must be HIGH, NORMAL, or LOW'),
  ],
  WatchStockController.create
);

// Update watch stock
router.put(
  '/watch/:id',
  [
    body('stockCode').optional().notEmpty().withMessage('Stock code cannot be empty'),
    body('stockName').optional().notEmpty().withMessage('Stock name cannot be empty'),
    body('watchLevel')
      .optional()
      .isIn(['HIGH', 'NORMAL', 'LOW'])
      .withMessage('Watch level must be HIGH, NORMAL, or LOW'),
  ],
  WatchStockController.update
);

// Delete watch stock
router.delete('/watch/:id', WatchStockController.delete);

// ==================== Buy Plan Routes ====================
// Get buy plans by diary ID
router.get('/buy/:diaryId', BuyPlanController.findByDiaryId);

// Create buy plan
router.post(
  '/buy',
  [
    body('diaryId').notEmpty().withMessage('Diary ID is required'),
    body('stockCode').notEmpty().withMessage('Stock code is required'),
    body('stockName').notEmpty().withMessage('Stock name is required'),
    body('targetPrice').isNumeric().withMessage('Target price must be a number'),
    body('positionPercent').isNumeric().withMessage('Position percent must be a number'),
  ],
  BuyPlanController.create
);

// Update buy plan
router.put(
  '/buy/:id',
  [
    body('stockCode').optional().notEmpty().withMessage('Stock code cannot be empty'),
    body('stockName').optional().notEmpty().withMessage('Stock name cannot be empty'),
    body('targetPrice').optional().isNumeric().withMessage('Target price must be a number'),
    body('positionPercent').optional().isNumeric().withMessage('Position percent must be a number'),
  ],
  BuyPlanController.update
);

// Delete buy plan
router.delete('/buy/:id', BuyPlanController.delete);

// ==================== Sell Plan Routes ====================
// Get sell plans by diary ID
router.get('/sell/:diaryId', SellPlanController.findByDiaryId);

// Create sell plan
router.post(
  '/sell',
  [
    body('diaryId').notEmpty().withMessage('Diary ID is required'),
    body('stockCode').notEmpty().withMessage('Stock code is required'),
    body('stockName').notEmpty().withMessage('Stock name is required'),
    body('targetPrice').isNumeric().withMessage('Target price must be a number'),
    body('sellPercent').isNumeric().withMessage('Sell percent must be a number'),
  ],
  SellPlanController.create
);

// Update sell plan
router.put(
  '/sell/:id',
  [
    body('stockCode').optional().notEmpty().withMessage('Stock code cannot be empty'),
    body('stockName').optional().notEmpty().withMessage('Stock name cannot be empty'),
    body('targetPrice').optional().isNumeric().withMessage('Target price must be a number'),
    body('sellPercent').optional().isNumeric().withMessage('Sell percent must be a number'),
  ],
  SellPlanController.update
);

// Delete sell plan
router.delete('/sell/:id', SellPlanController.delete);

// ==================== Stop Loss Routes ====================
// Get stop losses by diary ID
router.get('/stoploss/:diaryId', StopLossController.findByDiaryId);

// Create stop loss
router.post(
  '/stoploss',
  [
    body('diaryId').notEmpty().withMessage('Diary ID is required'),
    body('stockCode').notEmpty().withMessage('Stock code is required'),
    body('stockName').notEmpty().withMessage('Stock name is required'),
    body('stopPrice').isNumeric().withMessage('Stop price must be a number'),
    body('costPrice').optional().isNumeric().withMessage('Cost price must be a number'),
  ],
  StopLossController.create
);

// Update stop loss
router.put(
  '/stoploss/:id',
  [
    body('stockCode').optional().notEmpty().withMessage('Stock code cannot be empty'),
    body('stockName').optional().notEmpty().withMessage('Stock name cannot be empty'),
    body('stopPrice').optional().isNumeric().withMessage('Stop price must be a number'),
    body('costPrice').optional().isNumeric().withMessage('Cost price must be a number'),
  ],
  StopLossController.update
);

// Delete stop loss
router.delete('/stoploss/:id', StopLossController.delete);

export default router;
