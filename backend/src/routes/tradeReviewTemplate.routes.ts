import { Router } from 'express'
import { tradeReviewTemplateController } from '../controllers/tradeReviewTemplate.controller'

const router = Router()

router.get('/', tradeReviewTemplateController.getAll)
router.post('/', tradeReviewTemplateController.create)
router.put('/:id', tradeReviewTemplateController.update)
router.delete('/:id', tradeReviewTemplateController.delete)

export default router
