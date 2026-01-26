import { Router } from 'express';
import { body } from 'express-validator';
import { TradeController } from '../controllers/trade.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All trade routes require authentication
router.use(authMiddleware);

// Get all trades (with filters)
router.get('/', TradeController.findAll);

// Get trade by ID
router.get('/:id', TradeController.findById);

// Create trade
router.post(
  '/',
  [
    body('diaryId').notEmpty().withMessage('Diary ID is required'),
    body('stockCode').notEmpty().withMessage('Stock code is required'),
    body('stockName').notEmpty().withMessage('Stock name is required'),
    body('direction')
      .isIn(['BUY', 'SELL'])
      .withMessage('Direction must be BUY or SELL'),
    body('price')
      .isNumeric()
      .withMessage('Price must be a number'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number'),
  ],
  TradeController.create
);

// Update trade
router.put(
  '/:id',
  [
    body('stockCode').optional().notEmpty().withMessage('Stock code cannot be empty'),
    body('stockName').optional().notEmpty().withMessage('Stock name cannot be empty'),
    body('direction')
      .optional()
      .isIn(['BUY', 'SELL'])
      .withMessage('Direction must be BUY or SELL'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  ],
  TradeController.update
);

// Delete trade
router.delete('/:id', TradeController.delete);

export default router;
