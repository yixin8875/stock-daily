import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /stocks/search:
 *   get:
 *     summary: 搜索股票
 *     tags: [股票]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 返回搜索结果 }
 */
router.get('/search', StockController.searchStock);

/**
 * @swagger
 * /stocks/quotes:
 *   get:
 *     summary: 批量获取股票行情
 *     tags: [股票]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: codes
 *         required: true
 *         schema: { type: string }
 *         description: 逗号分隔的股票代码
 *     responses:
 *       200: { description: 返回行情数据 }
 */
router.get('/quotes', StockController.getQuotes);

/**
 * @swagger
 * /stocks/news:
 *   get:
 *     summary: 获取股票新闻
 *     tags: [股票]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema: { type: string }
 *     responses:
 *       200: { description: 返回新闻列表 }
 */
router.get('/news', StockController.getStockNews);

/**
 * @swagger
 * /stocks/{code}/kline:
 *   get:
 *     summary: 获取K线数据
 *     tags: [股票]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [daily, weekly, monthly] }
 *     responses:
 *       200: { description: 返回K线数据 }
 */
router.get('/:code/kline', StockController.getKLineData);

/**
 * @swagger
 * /stocks/{code}:
 *   get:
 *     summary: 获取单只股票行情
 *     tags: [股票]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 返回行情数据 }
 */
router.get('/:code', StockController.getQuote);

export default router;
