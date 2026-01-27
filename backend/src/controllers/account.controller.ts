import { Response, NextFunction } from 'express';
import { AccountService } from '../services/account.service';
import { AuthRequest, ApiError } from '../middlewares';

export class AccountController {
  /**
   * 获取所有交易账户
   */
  static async getAccounts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const accounts = await AccountService.getAccounts(req.userId);

      res.json({
        success: true,
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取单个账户
   */
  static async getAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const account = await AccountService.getAccount(req.userId, id);

      if (!account) {
        throw new ApiError(404, 'Account not found');
      }

      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建交易账户
   */
  static async createAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const { name, broker, accountNo, initialAssets, color, notes, isDefault } = req.body;

      if (!name) {
        throw new ApiError(400, 'Account name is required');
      }

      const account = await AccountService.createAccount(req.userId, {
        name,
        broker,
        accountNo,
        initialAssets,
        color,
        notes,
        isDefault,
      });

      res.status(201).json({
        success: true,
        data: account,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        next(new ApiError(400, 'Account name already exists'));
      } else {
        next(error);
      }
    }
  }

  /**
   * 更新交易账户
   */
  static async updateAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const { name, broker, accountNo, initialAssets, currentAssets, color, notes, isDefault, isActive } = req.body;

      const account = await AccountService.updateAccount(req.userId, id, {
        name,
        broker,
        accountNo,
        initialAssets,
        currentAssets,
        color,
        notes,
        isDefault,
        isActive,
      });

      res.json({
        success: true,
        data: account,
      });
    } catch (error: any) {
      if (error.message === 'Account not found') {
        next(new ApiError(404, 'Account not found'));
      } else if (error.code === 'P2002') {
        next(new ApiError(400, 'Account name already exists'));
      } else {
        next(error);
      }
    }
  }

  /**
   * 删除交易账户
   */
  static async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      await AccountService.deleteAccount(req.userId, id);

      res.json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Account not found') {
        next(new ApiError(404, 'Account not found'));
      } else {
        next(error);
      }
    }
  }

  /**
   * 获取账户统计
   */
  static async getAccountStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new ApiError(401, 'Unauthorized');
      }

      const id = req.params.id as string;
      const stats = await AccountService.getAccountStats(req.userId, id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      if (error.message === 'Account not found') {
        next(new ApiError(404, 'Account not found'));
      } else {
        next(error);
      }
    }
  }
}
