import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: 获取价格提醒列表
 *     tags: [价格提醒]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: includeTriggered
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: 返回提醒列表 }
 */
router.get('/', AlertController.getAlerts);

/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: 创建价格提醒
 *     tags: [价格提醒]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 创建成功 }
 */
router.post('/', AlertController.createAlert);

/**
 * @swagger
 * /alerts/check:
 *   post:
 *     summary: 检查价格提醒
 *     tags: [价格提醒]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回触发的提醒 }
 */
router.post('/check', AlertController.checkAlerts);

/**
 * @swagger
 * /alerts/{id}:
 *   put:
 *     summary: 更新价格提醒
 *     tags: [价格提醒]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 更新成功 }
 */
router.put('/:id', AlertController.updateAlert);

/**
 * @swagger
 * /alerts/{id}/reset:
 *   post:
 *     summary: 重置已触发的提醒
 *     tags: [价格提醒]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 重置成功 }
 */
router.post('/:id/reset', AlertController.resetAlert);

/**
 * @swagger
 * /alerts/{id}:
 *   delete:
 *     summary: 删除价格提醒
 *     tags: [价格提醒]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 删除成功 }
 */
router.delete('/:id', AlertController.deleteAlert);

export default router;
