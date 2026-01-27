import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

router.get('/', AlertController.getAlerts);
router.post('/', AlertController.createAlert);
router.post('/check', AlertController.checkAlerts);
router.put('/:id', AlertController.updateAlert);
router.post('/:id/reset', AlertController.resetAlert);
router.delete('/:id', AlertController.deleteAlert);

export default router;
