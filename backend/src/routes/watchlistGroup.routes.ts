import { Router } from 'express';
import { WatchlistGroupController } from '../controllers/watchlistGroup.controller';
import { authMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);

router.get('/', WatchlistGroupController.getGroups);
router.post('/', WatchlistGroupController.createGroup);
router.put('/:id', WatchlistGroupController.updateGroup);
router.delete('/:id', WatchlistGroupController.deleteGroup);
router.post('/move', WatchlistGroupController.moveStock);

export default router;
