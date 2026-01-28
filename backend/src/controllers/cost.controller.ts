import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { costService } from '../services/cost.service'

export const costController = {
  async getRecords(req: AuthRequest, res: Response) {
    try {
      const records = await costService.getRecords(req.userId!)
      res.json({ success: true, data: records })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取记录失败' })
    }
  },

  async addRecord(req: AuthRequest, res: Response) {
    try {
      const record = await costService.addRecord(req.userId!, req.body)
      res.json({ success: true, data: record })
    } catch (error) {
      res.status(500).json({ success: false, message: '添加记录失败' })
    }
  },

  async deleteRecord(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await costService.deleteRecord(req.userId!, id as string)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除记录失败' })
    }
  },

  async clearRecords(req: AuthRequest, res: Response) {
    try {
      await costService.clearRecords(req.userId!)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '清空记录失败' })
    }
  },
}
