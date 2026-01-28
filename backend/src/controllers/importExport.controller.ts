import { Response } from 'express';
import { importExportService } from '../services/importExport.service';
import { AuthRequest } from '../middlewares';

export class ImportExportController {
  static async importCSV(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: '未授权' });
      }

      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ success: false, message: 'CSV内容不能为空' });
      }

      const rows = importExportService.parseCSV(content);
      const result = await importExportService.importTrades(userId, rows);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: '导入失败' });
    }
  }

  static async importExcel(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: '未授权' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传Excel文件' });
      }

      const rows = importExportService.parseExcel(req.file.buffer);
      const result = await importExportService.importTrades(userId, rows);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: '导入失败' });
    }
  }

  static async exportCSV(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: '未授权' });
      }

      const csv = await importExportService.exportTradesToCSV(userId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=trades.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ success: false, message: '导出失败' });
    }
  }

  static async exportExcel(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: '未授权' });
      }

      const buffer = await importExportService.exportTradesToExcel(userId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=trades.xlsx');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ success: false, message: '导出失败' });
    }
  }
}
