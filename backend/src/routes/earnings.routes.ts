import { Router } from 'express'
import { earningsController } from '../controllers/earnings.controller'

const router = Router()

router.get('/', earningsController.getEarnings)
router.get('/upcoming', earningsController.getUpcoming)
router.post('/', earningsController.addEarnings)
router.put('/:id', earningsController.updateEarnings)
router.delete('/:id', earningsController.deleteEarnings)

export default router
