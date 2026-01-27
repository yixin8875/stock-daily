import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { portfolioService } from '../services/portfolio.service'

export const portfolioController = {
  async getIndustryDistribution(req: AuthRequest, res: Response) {
    try {
      const quotes = req.body.quotes || {}
      const distribution = await portfolioService.getIndustryDistribution(req.userId!, quotes)
      res.json({ success: true, data: distribution })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取行业分布失败' })
    }
  },

  async getRiskMetrics(req: AuthRequest, res: Response) {
    try {
      const quotes = req.body.quotes || {}
      const metrics = await portfolioService.getRiskMetrics(req.userId!, quotes)
      res.json({ success: true, data: metrics })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取风险指标失败' })
    }
  },

  async getPositionWarnings(req: AuthRequest, res: Response) {
    try {
      const quotes = req.body.quotes || {}
      const thresholds = req.body.thresholds
      const warnings = await portfolioService.getPositionWarnings(req.userId!, quotes, thresholds)
      res.json({ success: true, data: warnings })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取仓位预警失败' })
    }
  },

  async getPortfolioAnalysis(req: AuthRequest, res: Response) {
    try {
      const quotes = req.body.quotes || {}
      const [distribution, metrics, warnings] = await Promise.all([
        portfolioService.getIndustryDistribution(req.userId!, quotes),
        portfolioService.getRiskMetrics(req.userId!, quotes),
        portfolioService.getPositionWarnings(req.userId!, quotes),
      ])
      res.json({
        success: true,
        data: { distribution, metrics, warnings },
      })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取组合分析失败' })
    }
  },
}
