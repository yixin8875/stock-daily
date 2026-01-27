import { Router } from 'express';
import authRoutes from './auth.routes';
import diaryRoutes from './diary.routes';
import tradeRoutes from './trade.routes';
import planRoutes from './plan.routes';
import statisticsRoutes from './statistics.routes';
import tagRoutes from './tag.routes';
import searchRoutes from './search.routes';
import exportRoutes from './export.routes';
import userRoutes from './user.routes';
import reportRoutes from './report.routes';
import reviewRoutes from './review.routes';
import reminderRoutes from './reminder.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/diaries', diaryRoutes);
router.use('/trades', tradeRoutes);
router.use('/plans', planRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/tags', tagRoutes);
router.use('/search', searchRoutes);
router.use('/export', exportRoutes);
router.use('/user', userRoutes);
router.use('/reports', reportRoutes);
router.use('/review', reviewRoutes);
router.use('/reminders', reminderRoutes);

export default router;
