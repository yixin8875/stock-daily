import { Router } from 'express'
import { signalController } from '../controllers/signal.controller'

const router = Router()

router.get('/', signalController.getSignals)
router.post('/', signalController.createSignal)
router.post('/:id/read', signalController.markAsRead)
router.post('/read-all', signalController.markAllAsRead)
router.delete('/:id', signalController.deleteSignal)

export default router
