import { Router } from 'express';
import { body } from 'express-validator';
import { TradeController } from '../controllers/trade.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All trade routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /trades/statistics:
 *   get:
 *     summary: 获取交易统计
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回交易统计数据 }
 */
router.get('/statistics', TradeController.getStatistics);

/**
 * @swagger
 * /trades/calendar:
 *   get:
 *     summary: 获取交易日历
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回交易日历数据 }
 */
router.get('/calendar', TradeController.getCalendar);

/**
 * @swagger
 * /trades/stock/{stockCode}/history:
 *   get:
 *     summary: 获取股票交易历史
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: stockCode
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 返回股票交易历史 }
 */
router.get('/stock/:stockCode/history', TradeController.getStockHistory);

/**
 * @swagger
 * /trades:
 *   get:
 *     summary: 获取交易列表
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: 返回交易列表 }
 */
router.get('/', TradeController.findAll);

/**
 * @swagger
 * /trades/{id}:
 *   get:
 *     summary: 获取交易详情
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 返回交易详情 }
 */
router.get('/:id', TradeController.findById);

/**
 * @swagger
 * /trades:
 *   post:
 *     summary: 创建交易记录
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trade'
 *     responses:
 *       200: { description: 创建成功 }
 */
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

/**
 * @swagger
 * /trades/{id}:
 *   put:
 *     summary: 更新交易记录
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 更新成功 }
 */
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

/**
 * @swagger
 * /trades/{id}:
 *   delete:
 *     summary: 删除交易记录
 *     tags: [交易]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 删除成功 }
 */
router.delete('/:id', TradeController.delete);

export default router;
