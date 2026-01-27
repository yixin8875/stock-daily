import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { watchlistService } from '../services/watchlist.service'

export const watchlistController = {
  async getWatchlist(req: AuthRequest, res: Response) {
    try {
      const watchlist = await watchlistService.getWatchlist(req.userId!)
      res.json({ success: true, data: watchlist })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取自选股失败' })
    }
  },

  async addStock(req: AuthRequest, res: Response) {
    try {
      const stock = await watchlistService.addStock(req.userId!, req.body)
      res.json({ success: true, data: stock })
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(400).json({ success: false, message: '该股票已在自选列表中' })
      } else {
        res.status(500).json({ success: false, message: '添加失败' })
      }
    }
  },

  async updateStock(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      const stock = await watchlistService.updateStock(req.userId!, id, req.body)
      res.json({ success: true, data: stock })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新失败' })
    }
  },

  async removeStock(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      await watchlistService.removeStock(req.userId!, id)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除失败' })
    }
  },

  async reorderStocks(req: AuthRequest, res: Response) {
    try {
      const { stockIds } = req.body
      await watchlistService.reorderStocks(req.userId!, stockIds)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '排序失败' })
    }
  },
}
