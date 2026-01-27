import { prisma } from '../app';
import { Decimal } from '@prisma/client/runtime/library';

export interface CreateAccountParams {
  name: string;
  broker?: string;
  accountNo?: string;
  initialAssets?: number;
  color?: string;
  notes?: string;
  isDefault?: boolean;
}

export interface UpdateAccountParams {
  name?: string;
  broker?: string;
  accountNo?: string;
  initialAssets?: number;
  currentAssets?: number;
  color?: string;
  notes?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export class AccountService {
  /**
   * 获取用户所有交易账户
   */
  static async getAccounts(userId: string) {
    return prisma.tradingAccount.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * 获取单个账户
   */
  static async getAccount(userId: string, accountId: string) {
    return prisma.tradingAccount.findFirst({
      where: { id: accountId, userId },
    });
  }

  /**
   * 创建交易账户
   */
  static async createAccount(userId: string, params: CreateAccountParams) {
    // 如果设置为默认账户，先取消其他默认账户
    if (params.isDefault) {
      await prisma.tradingAccount.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // 如果是第一个账户，自动设为默认
    const existingCount = await prisma.tradingAccount.count({
      where: { userId },
    });

    return prisma.tradingAccount.create({
      data: {
        userId,
        name: params.name,
        broker: params.broker,
        accountNo: params.accountNo,
        initialAssets: params.initialAssets ? new Decimal(params.initialAssets) : null,
        currentAssets: params.initialAssets ? new Decimal(params.initialAssets) : null,
        color: params.color || '#1890FF',
        notes: params.notes,
        isDefault: params.isDefault || existingCount === 0,
      },
    });
  }

  /**
   * 更新交易账户
   */
  static async updateAccount(userId: string, accountId: string, params: UpdateAccountParams) {
    // 验证账户属于该用户
    const account = await prisma.tradingAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // 如果设置为默认账户，先取消其他默认账户
    if (params.isDefault) {
      await prisma.tradingAccount.updateMany({
        where: { userId, isDefault: true, id: { not: accountId } },
        data: { isDefault: false },
      });
    }

    return prisma.tradingAccount.update({
      where: { id: accountId },
      data: {
        name: params.name,
        broker: params.broker,
        accountNo: params.accountNo,
        initialAssets: params.initialAssets !== undefined
          ? new Decimal(params.initialAssets)
          : undefined,
        currentAssets: params.currentAssets !== undefined
          ? new Decimal(params.currentAssets)
          : undefined,
        color: params.color,
        notes: params.notes,
        isDefault: params.isDefault,
        isActive: params.isActive,
      },
    });
  }

  /**
   * 删除交易账户
   */
  static async deleteAccount(userId: string, accountId: string) {
    // 验证账户属于该用户
    const account = await prisma.tradingAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // 如果删除的是默认账户，将第一个其他账户设为默认
    if (account.isDefault) {
      const otherAccount = await prisma.tradingAccount.findFirst({
        where: { userId, id: { not: accountId } },
        orderBy: { createdAt: 'asc' },
      });

      if (otherAccount) {
        await prisma.tradingAccount.update({
          where: { id: otherAccount.id },
          data: { isDefault: true },
        });
      }
    }

    return prisma.tradingAccount.delete({
      where: { id: accountId },
    });
  }

  /**
   * 获取账户统计
   */
  static async getAccountStats(userId: string, accountId: string) {
    const account = await prisma.tradingAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const initialAssets = account.initialAssets ? Number(account.initialAssets) : 0;
    const currentAssets = account.currentAssets ? Number(account.currentAssets) : 0;

    const totalProfit = currentAssets - initialAssets;
    const profitRate = initialAssets > 0 ? (totalProfit / initialAssets) * 100 : 0;

    return {
      accountId,
      accountName: account.name,
      initialAssets,
      currentAssets,
      totalProfit: Math.round(totalProfit * 100) / 100,
      profitRate: Math.round(profitRate * 100) / 100,
    };
  }
}
