import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All search routes require authentication
router.use(authMiddleware);

// Full-text search
// GET /api/search?q=keyword&page=1&pageSize=20
router.get('/', SearchController.search);

export default router;
