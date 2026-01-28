import { Router } from 'express';
import { BehaviorController } from '../controllers/behavior.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/patterns', BehaviorController.getPatterns);
router.get('/biases', BehaviorController.getBiases);
router.get('/habits', BehaviorController.getHabits);

export default router;
