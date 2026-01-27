import { Router } from 'express';
import { PositionController } from '../controllers/position.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/', PositionController.getPositions);
router.get('/summary', PositionController.getPositionSummary);
router.get('/analysis', PositionController.getPositionAnalysis);
router.post('/', PositionController.addPosition);
router.put('/:id', PositionController.updatePosition);
router.post('/:id/reduce', PositionController.reducePosition);
router.delete('/:id', PositionController.deletePosition);

export default router;
