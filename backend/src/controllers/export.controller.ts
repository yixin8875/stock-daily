import { Response, NextFunction } from 'express';
import { ExportService, TradeExportType, ExportFormat } from '../services/export.service';
import { AuthRequest, ApiError } from '../middlewares';

export class ExportController {
  /**
   * Export diaries as JSON format
   * GET /api/export/json?startDate=2026-01-01&endDate=2026-01-31
   */
  static async exportJson(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      // Validate dates if provided
      if (startDate && isNaN(startDate.getTime())) {
        throw new ApiError(400, 'Invalid startDate format');
      }
      if (endDate && isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Invalid endDate format');
      }

      const jsonData = await ExportService.exportAsJson(req.userId, {
        startDate,
        endDate,
      });

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `stock-diary-export-${dateStr}.json`;

      // Set response headers for file download
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(jsonData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export diaries as CSV format
   * GET /api/export/csv?startDate=2026-01-01&endDate=2026-01-31
   */
  static async exportCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      // Validate dates if provided
      if (startDate && isNaN(startDate.getTime())) {
        throw new ApiError(400, 'Invalid startDate format');
      }
      if (endDate && isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Invalid endDate format');
      }

      const csvData = await ExportService.exportAsCsv(req.userId, {
        startDate,
        endDate,
      });

      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `stock-diary-export-${dateStr}.csv`;

      // Set response headers for file download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(csvData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export trades
   * GET /api/export/trades?exportType=detail&format=excel&startDate=2026-01-01&endDate=2026-01-31&stockCode=000001
   */
  static async exportTrades(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const exportType = (req.query.exportType as TradeExportType) || 'detail';
      const format = (req.query.format as ExportFormat) || 'excel';
      const stockCode = req.query.stockCode as string | undefined;

      if (!['detail', 'summary', 'analysis'].includes(exportType)) {
        throw new ApiError(400, 'Invalid exportType. Must be "detail", "summary", or "analysis"');
      }

      if (!['excel', 'csv', 'json'].includes(format)) {
        throw new ApiError(400, 'Invalid format. Must be "excel", "csv", or "json"');
      }

      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;

      if (startDate && isNaN(startDate.getTime())) {
        throw new ApiError(400, 'Invalid startDate format');
      }
      if (endDate && isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Invalid endDate format');
      }

      const data = await ExportService.exportTrades(
        req.userId,
        exportType,
        { startDate, endDate },
        format,
        stockCode
      );

      const dateStr = new Date().toISOString().split('T')[0];
      const typeLabel = { detail: '明细', summary: '汇总', analysis: '分析' }[exportType];

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="交易${typeLabel}-${dateStr}.json"`);
        res.send(data);
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="交易${typeLabel}-${dateStr}.csv"`);
        res.send(data);
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="交易${typeLabel}-${dateStr}.xlsx"`);
        res.send(data);
      }
    } catch (error) {
      next(error);
    }
  }
}