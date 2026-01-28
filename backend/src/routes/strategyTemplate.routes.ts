import { Router } from 'express';
import { StrategyTemplateController } from '../controllers/strategyTemplate.controller';
import { authMiddleware } from '../middlewares';

const router = Router();
router.use(authMiddleware);

router.get('/', StrategyTemplateController.getTemplates);
router.get('/category/:category', StrategyTemplateController.getByCategory);
router.post('/', StrategyTemplateController.create);
router.put('/:id', StrategyTemplateController.update);
router.delete('/:id', StrategyTemplateController.delete);

export default router;
