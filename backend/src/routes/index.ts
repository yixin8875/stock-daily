import { Router } from 'express';
import authRoutes from './auth.routes';
import diaryRoutes from './diary.routes';
import tradeRoutes from './trade.routes';
import planRoutes from './plan.routes';
import statisticsRoutes from './statistics.routes';
import tagRoutes from './tag.routes';
import searchRoutes from './search.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/diaries', diaryRoutes);
router.use('/trades', tradeRoutes);
router.use('/plans', planRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/tags', tagRoutes);
router.use('/search', searchRoutes);

export default router;
