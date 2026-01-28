import { Router } from 'express'
import { costController } from '../controllers/cost.controller'

const router = Router()

router.get('/', costController.getRecords)
router.post('/', costController.addRecord)
router.delete('/:id', costController.deleteRecord)
router.delete('/', costController.clearRecords)

export default router
