import { Response, NextFunction } from 'express';
import { ExportService } from '../services/export.service';
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
}