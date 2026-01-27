import { Router } from 'express'
import { portfolioController } from '../controllers/portfolio.controller'

const router = Router()

router.post('/industry', portfolioController.getIndustryDistribution)
router.post('/risk', portfolioController.getRiskMetrics)
router.post('/warnings', portfolioController.getPositionWarnings)
router.post('/analysis', portfolioController.getPortfolioAnalysis)

export default router
