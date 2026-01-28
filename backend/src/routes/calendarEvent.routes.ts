import { Router } from 'express'
import { calendarEventController } from '../controllers/calendarEvent.controller'

const router = Router()

router.get('/', calendarEventController.getEvents)
router.post('/', calendarEventController.createEvent)
router.delete('/:id', calendarEventController.deleteEvent)

export default router
