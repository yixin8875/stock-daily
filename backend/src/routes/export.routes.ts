import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All export routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/export/json
 * @desc    Export all diaries as JSON format
 * @query   startDate - Optional start date filter (YYYY-MM-DD)
 * @query   endDate - Optional end date filter (YYYY-MM-DD)
 * @access  Private
 */
router.get('/json', ExportController.exportJson);

/**
 * @route   GET /api/export/csv
 * @desc    Export all diaries as CSV format
 * @query   startDate - Optional start date filter (YYYY-MM-DD)
 * @query   endDate - Optional end date filter (YYYY-MM-DD)
 * @access  Private
 */
router.get('/csv', ExportController.exportCsv);

export default router;
