import { Router } from 'express'
import { portfolioController } from '../controllers/portfolio.controller'

const router = Router()

/**
 * @swagger
 * /portfolio/industry:
 *   post:
 *     summary: 获取行业分布
 *     tags: [投资组合]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回行业分布数据 }
 */
router.post('/industry', portfolioController.getIndustryDistribution)

/**
 * @swagger
 * /portfolio/risk:
 *   post:
 *     summary: 获取风险指标
 *     tags: [投资组合]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回风险指标 }
 */
router.post('/risk', portfolioController.getRiskMetrics)

/**
 * @swagger
 * /portfolio/warnings:
 *   post:
 *     summary: 获取仓位预警
 *     tags: [投资组合]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回预警信息 }
 */
router.post('/warnings', portfolioController.getPositionWarnings)

/**
 * @swagger
 * /portfolio/analysis:
 *   post:
 *     summary: 获取组合分析
 *     tags: [投资组合]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: 返回组合分析数据 }
 */
router.post('/analysis', portfolioController.getPortfolioAnalysis)

export default router
