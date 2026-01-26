import { Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';
import { AuthRequest, ApiError } from '../middlewares';

export class SearchController {
  /**
   * Full-text search across diary and trade fields
   * GET /api/search?q=keyword&page=1&pageSize=20
   */
  static async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      // Validate query parameter
      if (!query || query.trim().length === 0) {
        throw new ApiError(400, 'Search query is required');
      }

      // Validate pagination parameters
      if (page < 1) {
        throw new ApiError(400, 'Page must be greater than 0');
      }

      if (pageSize < 1 || pageSize > 100) {
        throw new ApiError(400, 'Page size must be between 1 and 100');
      }

      const result = await SearchService.search(
        req.userId,
        query,
        page,
        pageSize
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
