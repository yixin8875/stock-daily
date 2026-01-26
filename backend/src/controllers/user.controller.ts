import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { UserService } from '../services/user.service';
import { AuthRequest, ApiError } from '../middlewares';

export class UserController {
  /**
   * Get current user profile
   * GET /api/user/profile
   */
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const profile = await UserService.getProfile(req.userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const profile = await UserService.updateProfile(req.userId, req.body);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * PUT /api/user/password
   */
  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const result = await UserService.changePassword(req.userId, req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/user/stats
   */
  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const stats = await UserService.getUserStats(req.userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
