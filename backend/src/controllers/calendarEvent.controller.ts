import { Response } from 'express'
import { AuthRequest } from '../middlewares'
import { calendarEventService } from '../services/calendarEvent.service'

export const calendarEventController = {
  async getEvents(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query
      const events = await calendarEventService.getEvents(
        req.userId!,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      )
      res.json({ success: true, data: events })
    } catch (error) {
      res.status(500).json({ success: false, message: '获取事件失败' })
    }
  },

  async createEvent(req: AuthRequest, res: Response) {
    try {
      const event = await calendarEventService.createEvent(req.userId!, req.body)
      res.json({ success: true, data: event })
    } catch (error) {
      res.status(500).json({ success: false, message: '创建事件失败' })
    }
  },

  async deleteEvent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await calendarEventService.deleteEvent(req.userId!, id as string)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, message: '删除事件失败' })
    }
  },
}
