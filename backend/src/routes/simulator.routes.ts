import { Router } from 'express'
import { simulatorController } from '../controllers/simulator.controller'

const router = Router()

router.get('/account', simulatorController.getAccount)
router.get('/trades', simulatorController.getTrades)
router.post('/trades', simulatorController.createTrade)
router.post('/reset', simulatorController.resetAccount)

export default router
