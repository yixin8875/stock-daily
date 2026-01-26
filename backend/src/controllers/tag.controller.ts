import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { TagService } from '../services/tag.service';
import { AuthRequest, ApiError } from '../middlewares';

export class TagController {
  /**
   * Create a new tag
   */
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const tag = await TagService.create(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tags for the authenticated user
   */
  static async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const filter = {
        category: req.query.category as string | undefined,
      };

      const tags = await TagService.findAll(req.userId, filter as any);

      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single tag by ID
   */
  static async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const tag = await TagService.findById(req.userId, id);

      res.json({
        success: true,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a tag
   */
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const tag = await TagService.update(req.userId, id, req.body);

      res.json({
        success: true,
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a tag
   */
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const result = await TagService.delete(req.userId, id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initialize preset tags for the user
   */
  static async initPresetTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const result = await TagService.initPresetTags(req.userId);

      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}