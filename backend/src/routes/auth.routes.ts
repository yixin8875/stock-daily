import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers';
import { authMiddleware } from '../middlewares';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('username')
      .isLength({ min: 2 })
      .withMessage('Username must be at least 2 characters'),
  ],
  AuthController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  AuthController.login
);

// Get current user
router.get('/me', authMiddleware, AuthController.me);

// Logout
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
