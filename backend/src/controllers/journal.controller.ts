import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { journalService } from '../services/journal.service'

export const journalController = {
  async getJournals(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const result = await journalService.getJournals(req.userId!, page, limit)
      res.json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取日志失败' })
    }
  },

  async getJournalByDate(req: AuthRequest, res: Response) {
    try {
      const { date } = req.params
      const journal = await journalService.getJournalByDate(req.userId!, date as string)
      res.json({ success: true, data: journal })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取日志失败' })
    }
  },

  async createJournal(req: AuthRequest, res: Response) {
    try {
      const journal = await journalService.createJournal(req.userId!, req.body)
      res.json({ success: true, data: journal })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建日志失败' })
    }
  },

  async updateJournal(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const journal = await journalService.updateJournal(req.userId!, id as string, req.body)
      res.json({ success: true, data: journal })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新日志失败' })
    }
  },

  async deleteJournal(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await journalService.deleteJournal(req.userId!, id as string)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除日志失败' })
    }
  },
}
