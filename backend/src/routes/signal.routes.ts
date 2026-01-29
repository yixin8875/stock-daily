import { Router } from 'express'
import { signalController } from '../controllers/signal.controller'

const router = Router()

/**
 * @swagger
 * /signals:
 *   get:
 *     summary: 获取交易信号列表
 *     tags: [交易信号]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: 返回信号列表 }
 */
router.get('/', signalController.getSignals)

/**
 * @swagger
 * /signals:
 *   post:
 *     summary: 创建交易信号
 *     tags: [交易信号]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 创建成功 }
 */
router.post('/', signalController.createSignal)

/**
 * @swagger
 * /signals/{id}/read:
 *   post:
 *     summary: 标记信号已读
 *     tags: [交易信号]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 标记成功 }
 */
router.post('/:id/read', signalController.markAsRead)

/**
 * @swagger
 * /signals/read-all:
 *   post:
 *     summary: 标记所有信号已读
 *     tags: [交易信号]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 标记成功 }
 */
router.post('/read-all', signalController.markAllAsRead)

/**
 * @swagger
 * /signals/{id}:
 *   delete:
 *     summary: 删除信号
 *     tags: [交易信号]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: 删除成功 }
 */
router.delete('/:id', signalController.deleteSignal)

export default router
