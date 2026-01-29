import { Router } from 'express';
import { twoFactorController } from '../controllers/twoFactor.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /2fa/setup:
 *   post:
 *     summary: 设置双因素认证
 *     tags: [双因素认证]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回二维码和密钥 }
 */
router.post('/setup', twoFactorController.setup);

/**
 * @swagger
 * /2fa/confirm:
 *   post:
 *     summary: 确认启用2FA
 *     tags: [双因素认证]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 启用成功 }
 */
router.post('/confirm', twoFactorController.confirm);

/**
 * @swagger
 * /2fa/disable:
 *   post:
 *     summary: 禁用2FA
 *     tags: [双因素认证]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 禁用成功 }
 */
router.post('/disable', twoFactorController.disable);

/**
 * @swagger
 * /2fa/status:
 *   get:
 *     summary: 获取2FA状态
 *     tags: [双因素认证]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回启用状态 }
 */
router.get('/status', twoFactorController.status);

export default router;
