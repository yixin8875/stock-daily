import { Router } from 'express'
import { noteController } from '../controllers/note.controller'

const router = Router()

router.get('/', noteController.getNotes)
router.post('/', noteController.createNote)
router.put('/:id', noteController.updateNote)
router.delete('/:id', noteController.deleteNote)

export default router
