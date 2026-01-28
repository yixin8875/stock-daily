import { Router } from 'express'
import { goalController } from '../controllers/goal.controller'

const router = Router()

router.get('/', goalController.getGoals)
router.post('/', goalController.createGoal)
router.put('/:id', goalController.updateGoal)
router.delete('/:id', goalController.deleteGoal)

export default router
