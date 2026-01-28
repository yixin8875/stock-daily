import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { simulatorService } from '../services/simulator.service'

export const simulatorController = {
  async getAccount(req: AuthRequest, res: Response) {
    try {
      const account = await simulatorService.getAccount(req.userId!)
      res.json({ success: true, data: account })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取账户失败' })
    }
  },

  async getTrades(req: AuthRequest, res: Response) {
    try {
      const trades = await simulatorService.getTrades(req.userId!)
      res.json({ success: true, data: trades })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取交易失败' })
    }
  },

  async createTrade(req: AuthRequest, res: Response) {
    try {
      const trade = await simulatorService.createTrade(req.userId!, req.body)
      res.json({ success: true, data: trade })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建交易失败' })
    }
  },

  async resetAccount(req: AuthRequest, res: Response) {
    try {
      await simulatorService.resetAccount(req.userId!)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '重置账户失败' })
    }
  },
}
