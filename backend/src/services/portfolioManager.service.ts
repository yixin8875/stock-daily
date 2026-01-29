import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface AccountInput {
  name: string;
  broker?: string;
  initialAssets?: number;
  notes?: string;
}

export interface AccountSummary {
  id: string;
  name: string;
  broker: string | null;
  initialAssets: number;
  currentAssets: number;
  totalProfit: number;
  profitRate: number;
  isDefault: boolean;
}

export class PortfolioManagerService {
  // 创建交易账户
  static async createAccount(userId: string, input: AccountInput) {
    return prisma.tradingAccount.create({
      data: {
        userId,
        name: input.name,
        broker: input.broker,
        initialAssets: input.initialAssets,
        currentAssets: input.initialAssets,
        notes: input.notes,
      },
    });
  }

  // 获取用户所有账户
  static async getAccounts(userId: string): Promise<AccountSummary[]> {
    const accounts = await prisma.tradingAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    return accounts.map(a => {
      const initial = Number(a.initialAssets) || 0;
      const current = Number(a.currentAssets) || 0;
      const profit = current - initial;
      const rate = initial > 0 ? (profit / initial) * 100 : 0;

      return {
        id: a.id,
        name: a.name,
        broker: a.broker,
        initialAssets: initial,
        currentAssets: current,
        totalProfit: profit,
        profitRate: Math.round(rate * 100) / 100,
        isDefault: a.isDefault,
      };
    });
  }

  // 获取账户详情
  static async getAccountDetail(userId: string, accountId: string) {
    const account = await prisma.tradingAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return account;
  }

  // 更新账户
  static async updateAccount(
    userId: string,
    accountId: string,
    input: Partial<AccountInput & { currentAssets: number }>
  ) {
    const account = await prisma.tradingAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return prisma.tradingAccount.update({
      where: { id: accountId },
      data: input,
    });
  }

  // 删除账户
  static async deleteAccount(userId: string, accountId: string) {
    const account = await prisma.tradingAccount.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return prisma.tradingAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });
  }

  // 设置默认账户
  static async setDefaultAccount(userId: string, accountId: string) {
    // 先取消所有默认
    await prisma.tradingAccount.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // 设置新默认
    return prisma.tradingAccount.update({
      where: { id: accountId },
      data: { isDefault: true },
    });
  }

  // 获取账户统计
  static async getAccountStats(userId: string) {
    const accounts = await this.getAccounts(userId);

    const totalInitial = accounts.reduce((sum, a) => sum + a.initialAssets, 0);
    const totalCurrent = accounts.reduce((sum, a) => sum + a.currentAssets, 0);
    const totalProfit = totalCurrent - totalInitial;
    const totalRate = totalInitial > 0 ? (totalProfit / totalInitial) * 100 : 0;

    return {
      accountCount: accounts.length,
      totalInitialAssets: totalInitial,
      totalCurrentAssets: totalCurrent,
      totalProfit,
      totalProfitRate: Math.round(totalRate * 100) / 100,
    };
  }
}

export const portfolioManagerService = new PortfolioManagerService();
