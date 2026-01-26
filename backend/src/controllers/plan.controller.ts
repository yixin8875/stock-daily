import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
  WatchStockService,
  BuyPlanService,
  SellPlanService,
  StopLossService,
} from '../services/plan.service';
import { AuthRequest, ApiError } from '../middlewares';

// ==================== Watch Stock Controller ====================
export class WatchStockController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const watchStock = await WatchStockService.create(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: watchStock,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByDiaryId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const diaryId = req.params.diaryId as string;
      const watchStocks = await WatchStockService.findByDiaryId(req.userId, diaryId);

      res.json({
        success: true,
        data: watchStocks,
      });
    } catch (error) {
      next(error);
    }
  }

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
      const watchStock = await WatchStockService.update(req.userId, id, req.body);

      res.json({
        success: true,
        data: watchStock,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const result = await WatchStockService.delete(req.userId, id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ==================== Buy Plan Controller ====================
export class BuyPlanController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const buyPlan = await BuyPlanService.create(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: buyPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByDiaryId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const diaryId = req.params.diaryId as string;
      const buyPlans = await BuyPlanService.findByDiaryId(req.userId, diaryId);

      res.json({
        success: true,
        data: buyPlans,
      });
    } catch (error) {
      next(error);
    }
  }

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
      const buyPlan = await BuyPlanService.update(req.userId, id, req.body);

      res.json({
        success: true,
        data: buyPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const result = await BuyPlanService.delete(req.userId, id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ==================== Sell Plan Controller ====================
export class SellPlanController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const sellPlan = await SellPlanService.create(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: sellPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByDiaryId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const diaryId = req.params.diaryId as string;
      const sellPlans = await SellPlanService.findByDiaryId(req.userId, diaryId);

      res.json({
        success: true,
        data: sellPlans,
      });
    } catch (error) {
      next(error);
    }
  }

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
      const sellPlan = await SellPlanService.update(req.userId, id, req.body);

      res.json({
        success: true,
        data: sellPlan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const result = await SellPlanService.delete(req.userId, id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

// ==================== Stop Loss Controller ====================
export class StopLossController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg);
      }

      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const stopLoss = await StopLossService.create(req.userId, req.body);

      res.status(201).json({
        success: true,
        data: stopLoss,
      });
    } catch (error) {
      next(error);
    }
  }

  static async findByDiaryId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const diaryId = req.params.diaryId as string;
      const stopLosses = await StopLossService.findByDiaryId(req.userId, diaryId);

      res.json({
        success: true,
        data: stopLosses,
      });
    } catch (error) {
      next(error);
    }
  }

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
      const stopLoss = await StopLossService.update(req.userId, id, req.body);

      res.json({
        success: true,
        data: stopLoss,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const result = await StopLossService.delete(req.userId, id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}