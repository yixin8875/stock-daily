import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers';
import { authMiddleware } from '../middlewares';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, username]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               username: { type: string, minLength: 2 }
 *     responses:
 *       200: { description: 注册成功 }
 *       400: { description: 参数错误 }
 */
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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [认证]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: 登录成功，返回 token }
 *       401: { description: 认证失败 }
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  AuthController.login
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [认证]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回用户信息 }
 *       401: { description: 未授权 }
 */
router.get('/me', authMiddleware, AuthController.me);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 退出登录
 *     tags: [认证]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 退出成功 }
 */
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
