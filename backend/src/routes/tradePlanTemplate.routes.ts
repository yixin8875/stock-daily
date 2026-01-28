import { Router } from 'express'
import { tradePlanTemplateController } from '../controllers/tradePlanTemplate.controller'

const router = Router()

router.get('/', tradePlanTemplateController.getAll)
router.post('/', tradePlanTemplateController.create)
router.put('/:id', tradePlanTemplateController.update)
router.delete('/:id', tradePlanTemplateController.delete)

export default router
