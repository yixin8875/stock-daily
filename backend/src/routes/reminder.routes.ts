import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All reminder routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/reminders/today
 * @desc    Get today's reminders (yesterday's plans)
 * @access  Private
 */
router.get('/today', ReminderController.getTodayReminders);

/**
 * @route   GET /api/reminders/pending
 * @desc    Get pending plans from last 7 days
 * @access  Private
 */
router.get('/pending', ReminderController.getPendingPlans);

export default router;
