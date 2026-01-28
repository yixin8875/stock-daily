import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { noteService } from '../services/note.service'

export const noteController = {
  async getNotes(req: AuthRequest, res: Response) {
    try {
      const category = req.query.category as string | undefined
      const notes = await noteService.getNotes(req.userId!, category)
      res.json({ success: true, data: notes })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取笔记失败' })
    }
  },

  async createNote(req: AuthRequest, res: Response) {
    try {
      const note = await noteService.createNote(req.userId!, req.body)
      res.json({ success: true, data: note })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建笔记失败' })
    }
  },

  async updateNote(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const note = await noteService.updateNote(req.userId!, id as string, req.body)
      res.json({ success: true, data: note })
    } catch (error) {
      res.status(500).json({ success: false, message: '更新笔记失败' })
    }
  },

  async deleteNote(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await noteService.deleteNote(req.userId!, id as string)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除笔记失败' })
    }
  },
}
