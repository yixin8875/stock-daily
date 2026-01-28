import { Router } from 'express'
import { dividendController } from '../controllers/dividend.controller'

const router = Router()

router.get('/', dividendController.getDividends)
router.post('/', dividendController.createDividend)
router.put('/:id', dividendController.updateDividend)
router.delete('/:id', dividendController.deleteDividend)

export default router
