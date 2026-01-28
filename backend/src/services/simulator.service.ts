import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SimTradeInput {
  stockName: string
  tradeType: string
  price: number
  quantity: number
}

export const simulatorService = {
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

  async createTrade(userId: string, data: SimTradeInput) {
    const amount = data.price * data.quantity

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
    const newBalance = data.tradeType === 'buy'
      ? currentBalance - amount
      : currentBalance + amount

    // 创建交易并更新余额
    const [trade] = await prisma.$transaction([
      prisma.simulatedTrade.create({
        data: {
          userId,
          stockName: data.stockName,
          tradeType: data.tradeType,
          price: data.price,
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

    return trade
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
