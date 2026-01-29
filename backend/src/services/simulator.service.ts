import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SimTradeInput {
  stockName: string
  stockCode?: string
  tradeType: string
  price: number
  quantity: number
}

export interface TradeCost {
  commission: number      // 佣金
  stampDuty: number       // 印花税
  transferFee: number     // 过户费
  slippage: number        // 滑点成本
  total: number           // 总费用
}

export interface SimulatorConfig {
  commissionRate: number  // 佣金费率 (默认万2.5)
  minCommission: number   // 最低佣金 (默认5元)
  stampDutyRate: number   // 印花税率 (卖出千1)
  transferFeeRate: number // 过户费率 (万0.2)
  slippageRate: number    // 滑点率 (默认0.1%)
}

const DEFAULT_CONFIG: SimulatorConfig = {
  commissionRate: 0.00025,
  minCommission: 5,
  stampDutyRate: 0.001,
  transferFeeRate: 0.00002,
  slippageRate: 0.001,
}

export const simulatorService = {
  // 计算交易费用
  calculateTradeCost(
    amount: number,
    tradeType: string,
    config: SimulatorConfig = DEFAULT_CONFIG
  ): TradeCost {
    // 佣金 (买卖都收)
    let commission = amount * config.commissionRate
    commission = Math.max(commission, config.minCommission)

    // 印花税 (仅卖出收取)
    const stampDuty = tradeType === 'sell' ? amount * config.stampDutyRate : 0

    // 过户费
    const transferFee = amount * config.transferFeeRate

    // 滑点成本
    const slippage = amount * config.slippageRate

    return {
      commission: Math.round(commission * 100) / 100,
      stampDuty: Math.round(stampDuty * 100) / 100,
      transferFee: Math.round(transferFee * 100) / 100,
      slippage: Math.round(slippage * 100) / 100,
      total: Math.round((commission + stampDuty + transferFee + slippage) * 100) / 100,
    }
  },

  // 计算滑点后的实际成交价
  calculateSlippagePrice(price: number, tradeType: string, slippageRate: number = 0.001): number {
    const slippage = price * slippageRate
    return tradeType === 'buy' ? price + slippage : price - slippage
  },

  async getAccount(userId: string) {
    return prisma.simulatedAccount.findUnique({
      where: { userId },
    })
  },

  async getTrades(userId: string) {
    return prisma.simulatedTrade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  },

  async createTrade(userId: string, data: SimTradeInput, enableCost: boolean = true) {
    // 计算滑点后的实际成交价
    const actualPrice = enableCost
      ? this.calculateSlippagePrice(data.price, data.tradeType)
      : data.price
    const amount = actualPrice * data.quantity

    // 计算交易费用
    const cost = enableCost
      ? this.calculateTradeCost(amount, data.tradeType)
      : { commission: 0, stampDuty: 0, transferFee: 0, slippage: 0, total: 0 }

    // 获取或创建账户
    let account = await prisma.simulatedAccount.findUnique({
      where: { userId },
    })

    if (!account) {
      account = await prisma.simulatedAccount.create({
        data: { userId },
      })
    }

    const currentBalance = Number(account.currentBalance)
    const totalCost = amount + cost.total
    const newBalance = data.tradeType === 'buy'
      ? currentBalance - totalCost
      : currentBalance + amount - cost.total

    // 创建交易并更新余额
    const [trade] = await prisma.$transaction([
      prisma.simulatedTrade.create({
        data: {
          userId,
          stockName: data.stockName,
          tradeType: data.tradeType,
          price: actualPrice,
          quantity: data.quantity,
          amount,
          balance: newBalance,
        },
      }),
      prisma.simulatedAccount.update({
        where: { userId },
        data: { currentBalance: newBalance },
      }),
    ])

    return { trade, cost }
  },

  async resetAccount(userId: string) {
    await prisma.$transaction([
      prisma.simulatedTrade.deleteMany({ where: { userId } }),
      prisma.simulatedAccount.upsert({
        where: { userId },
        update: { currentBalance: 100000 },
        create: { userId },
      }),
    ])
  },
}
