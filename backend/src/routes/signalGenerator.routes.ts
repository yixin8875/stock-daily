import { Router } from 'express';
import { signalGeneratorController } from '../controllers/signalGenerator.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /signal-generator/generate:
 *   post:
 *     summary: 为股票生成交易信号
 *     tags: [信号生成]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stockCode: { type: string }
 *               stockName: { type: string }
 *               klines: { type: array }
 *     responses:
 *       200: { description: 返回生成的信号 }
 */
router.post('/generate', signalGeneratorController.generateForStock);

/**
 * @swagger
 * /signal-generator/save:
 *   post:
 *     summary: 保存生成的信号
 *     tags: [信号生成]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 保存成功 }
 */
router.post('/save', signalGeneratorController.saveSignals);

/**
 * @swagger
 * /signal-generator/config:
 *   get:
 *     summary: 获取信号生成配置
 *     tags: [信号生成]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回配置 }
 */
router.get('/config', signalGeneratorController.getConfig);

export default router;
