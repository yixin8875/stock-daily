import { Router } from 'express'
import { journalController } from '../controllers/journal.controller'

const router = Router()

router.get('/', journalController.getJournals)
router.get('/:date', journalController.getJournalByDate)
router.post('/', journalController.createJournal)
router.put('/:id', journalController.updateJournal)
router.delete('/:id', journalController.deleteJournal)

export default router
