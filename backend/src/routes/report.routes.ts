import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All report routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/reports/:period/list
 * @desc    Get list of reports
 * @param   period - 'week' or 'month'
 * @query   limit - Number of reports to return (default: 10)
 * @access  Private
 */
router.get('/:period/list', ReportController.getReportList);

/**
 * @route   GET /api/reports/:period/export
 * @desc    Export report as Excel file
 * @param   period - 'week' or 'month'
 * @query   date - Optional date (YYYY-MM-DD), defaults to current date
 * @access  Private
 */
router.get('/:period/export', ReportController.exportReport);

/**
 * @route   GET /api/reports/:period
 * @desc    Get weekly or monthly report
 * @param   period - 'week' or 'month'
 * @query   date - Optional date (YYYY-MM-DD), defaults to current date
 * @access  Private
 */
router.get('/:period', ReportController.getReport);

export default router;
