import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All review routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/review/daily
 * @desc    Get daily review (plan vs execution comparison)
 * @query   date - Date to review (YYYY-MM-DD), defaults to current date
 * @access  Private
 */
router.get('/daily', ReviewController.getDailyReview);

/**
 * @route   GET /api/review/trend
 * @desc    Get deviation trend over time
 * @query   startDate - Optional start date (YYYY-MM-DD)
 * @query   endDate - Optional end date (YYYY-MM-DD)
 * @query   limit - Number of days (default: 30)
 * @access  Private
 */
router.get('/trend', ReviewController.getDeviationTrend);

/**
 * @route   GET /api/review/dates
 * @desc    Get list of dates with review data
 * @query   startDate - Optional start date (YYYY-MM-DD)
 * @query   endDate - Optional end date (YYYY-MM-DD)
 * @access  Private
 */
router.get('/dates', ReviewController.getReviewDates);

export default router;
