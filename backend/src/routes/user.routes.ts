import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user profile
router.get('/profile', UserController.getProfile);

// Update user profile
router.put(
  '/profile',
  [
    body('username')
      .optional()
      .isLength({ min: 2 })
      .withMessage('用户名至少需要2个字符'),
  ],
  UserController.updateProfile
);

// Change password
router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('请输入当前密码'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('新密码至少需要6个字符'),
  ],
  UserController.changePassword
);

// Get user statistics
router.get('/stats', UserController.getStats);

export default router;
