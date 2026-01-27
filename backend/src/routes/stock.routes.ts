import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All stock routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/stocks/search
 * @desc    Search stocks by keyword
 * @query   keyword - Search keyword
 * @access  Private
 */
router.get('/search', StockController.searchStock);

/**
 * @route   GET /api/stocks/quotes
 * @desc    Get multiple stock quotes
 * @query   codes - Comma-separated stock codes
 * @access  Private
 */
router.get('/quotes', StockController.getQuotes);

/**
 * @route   GET /api/stocks/news
 * @desc    Get stock news
 * @query   code - Optional stock code for specific stock news
 * @access  Private
 */
router.get('/news', StockController.getStockNews);

/**
 * @route   GET /api/stocks/:code/kline
 * @desc    Get K-line data for a stock
 * @param   code - Stock code
 * @query   period - daily/weekly/monthly
 * @access  Private
 */
router.get('/:code/kline', StockController.getKLineData);

/**
 * @route   GET /api/stocks/:code
 * @desc    Get single stock quote
 * @param   code - Stock code
 * @access  Private
 */
router.get('/:code', StockController.getQuote);

export default router;
