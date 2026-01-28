import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { goalService } from '../services/goal.service'

export const goalController = {
  async getGoals(req: AuthRequest, res: Response) {
    try {
      const goals = await goalService.getGoals(req.userId!)
      res.json({ success: true, data: goals })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取目标失败' })
    }
  },

  async createGoal(req: AuthRequest, res: Response) {
    try {
      const goal = await goalService.createGoal(req.userId!, req.body)
      res.json({ success: true, data: goal })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建目标失败' })
    }
  },

  async updateGoal(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const goal = await goalService.updateGoal(req.userId!, id as string, req.body)
      res.json({ success: true, data: goal })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新目标失败' })
    }
  },

  async deleteGoal(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await goalService.deleteGoal(req.userId!, id as string)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除目标失败' })
    }
  },
}
