import { Router } from 'express';
import { body } from 'express-validator';
import { TagController } from '../controllers/tag.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All tag routes require authentication
router.use(authMiddleware);

// Get all tags (with optional category filter)
router.get('/', TagController.findAll);

// Get tag by ID
router.get('/:id', TagController.findById);

// Create tag
router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('Tag name is required')
      .isLength({ max: 50 })
      .withMessage('Tag name must be at most 50 characters'),
    body('category')
      .isIn(['STRATEGY', 'SECTOR', 'REFLECTION', 'CUSTOM'])
      .withMessage('Category must be STRATEGY, SECTOR, REFLECTION, or CUSTOM'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color (e.g., #1890FF)'),
  ],
  TagController.create
);

// Update tag
router.put(
  '/:id',
  [
    body('name')
      .optional()
      .notEmpty()
      .withMessage('Tag name cannot be empty')
      .isLength({ max: 50 })
      .withMessage('Tag name must be at most 50 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color (e.g., #1890FF)'),
  ],
  TagController.update
);

// Delete tag
router.delete('/:id', TagController.delete);

// Initialize preset tags
router.post('/init', TagController.initPresetTags);

export default router;
