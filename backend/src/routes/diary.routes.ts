import { Router } from 'express';
import { body } from 'express-validator';
import { DiaryController } from '../controllers';
import { authMiddleware } from '../middlewares';

const router = Router();

// All diary routes require authentication
router.use(authMiddleware);

// Get calendar data for a specific month
router.get('/calendar', DiaryController.getCalendarData);

// Get complete diary detail for a specific date
router.get('/detail/:date', DiaryController.getDetailByDate);

// Get all diaries (paginated)
router.get('/', DiaryController.findAll);

// Get diary by date
router.get('/:date', DiaryController.findByDate);

// Create diary
router.post(
  '/',
  [
    body('date').notEmpty().withMessage('Date is required'),
  ],
  DiaryController.create
);

// Update diary
router.put(
  '/:id',
  DiaryController.update
);

// Delete diary
router.delete('/:id', DiaryController.delete);

export default router;
