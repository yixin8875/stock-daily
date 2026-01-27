import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PositionWithValue {
  stockCode: string
  stockName: string
  quantity: number
  costPrice: number
  totalCost: number
  currentPrice: number
  marketValue: number
  profit: number
  profitRate: number
  weight: number
  industry: string | null
}

interface IndustryDistribution {
  industry: string
  marketValue: number
  weight: number
  stockCount: number
  stocks: string[]
}

interface RiskMetrics {
  totalValue: number
  totalCost: number
  totalProfit: number
  totalProfitRate: number
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  beta: number
  concentrationRisk: number
}

interface PositionWarning {
  stockCode: string
  stockName: string
  warningType: 'OVERWEIGHT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'HIGH_LOSS'
  currentValue: number
  threshold: number
  message: string
}

export const portfolioService = {
  async getPositionsWithValue(userId: string, quotes: Record<string, number>) {
    const positions = await prisma.position.findMany({
      where: { userId },
    })

    return positions.map(p => {
      const currentPrice = quotes[p.stockCode] || Number(p.costPrice)
      const marketValue = currentPrice * p.quantity
      const profit = marketValue - Number(p.totalCost)
      const profitRate = Number(p.totalCost) > 0 ? (profit / Number(p.totalCost)) * 100 : 0

      return {
        stockCode: p.stockCode,
        stockName: p.stockName,
        quantity: p.quantity,
        costPrice: Number(p.costPrice),
        totalCost: Number(p.totalCost),
        currentPrice,
        marketValue,
        profit,
        profitRate,
        weight: 0,
        industry: p.industry,
        targetPrice: p.targetPrice ? Number(p.targetPrice) : null,
        stopPrice: p.stopPrice ? Number(p.stopPrice) : null,
      }
    })
  },

  async getIndustryDistribution(userId: string, quotes: Record<string, number>): Promise<IndustryDistribution[]> {
    const positions = await this.getPositionsWithValue(userId, quotes)
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)

    const industryMap = new Map<string, IndustryDistribution>()

    positions.forEach(p => {
      const industry = p.industry || '未分类'
      if (!industryMap.has(industry)) {
        industryMap.set(industry, {
          industry,
          marketValue: 0,
          weight: 0,
          stockCount: 0,
          stocks: [],
        })
      }
      const dist = industryMap.get(industry)!
      dist.marketValue += p.marketValue
      dist.stockCount += 1
      dist.stocks.push(p.stockName)
    })

    return Array.from(industryMap.values()).map(d => ({
      ...d,
      weight: totalValue > 0 ? (d.marketValue / totalValue) * 100 : 0,
    })).sort((a, b) => b.marketValue - a.marketValue)
  },

  async getRiskMetrics(userId: string, quotes: Record<string, number>): Promise<RiskMetrics> {
    const positions = await this.getPositionsWithValue(userId, quotes)
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
    const totalCost = positions.reduce((sum, p) => sum + p.totalCost, 0)
    const totalProfit = totalValue - totalCost
    const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

    // 计算集中度风险 (HHI指数)
    const weights = positions.map(p => totalValue > 0 ? p.marketValue / totalValue : 0)
    const concentrationRisk = weights.reduce((sum, w) => sum + w * w, 0) * 100

    // 获取历史交易数据计算波动率
    const trades = await prisma.trade.findMany({
      where: {
        diary: { userId },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // 简化的波动率计算
    const returns = trades.map(t => Number(t.amount))
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
    const variance = returns.length > 1
      ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)
      : 0
    const volatility = Math.sqrt(variance)

    // 简化的夏普比率 (假设无风险利率3%)
    const riskFreeRate = 3
    const sharpeRatio = volatility > 0 ? (totalProfitRate - riskFreeRate) / volatility : 0

    return {
      totalValue,
      totalCost,
      totalProfit,
      totalProfitRate,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: 0, // 需要历史数据计算
      volatility: Math.round(volatility * 100) / 100,
      beta: 1, // 需要与大盘对比计算
      concentrationRisk: Math.round(concentrationRisk * 100) / 100,
    }
  },

  async getPositionWarnings(
    userId: string,
    quotes: Record<string, number>,
    thresholds = { maxWeight: 30, stopLossPercent: -10, takeProfitPercent: 30 }
  ): Promise<PositionWarning[]> {
    const positions = await this.getPositionsWithValue(userId, quotes)
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
    const warnings: PositionWarning[] = []

    positions.forEach(p => {
      const weight = totalValue > 0 ? (p.marketValue / totalValue) * 100 : 0

      // 仓位过重预警
      if (weight > thresholds.maxWeight) {
        warnings.push({
          stockCode: p.stockCode,
          stockName: p.stockName,
          warningType: 'OVERWEIGHT',
          currentValue: weight,
          threshold: thresholds.maxWeight,
          message: `${p.stockName}仓位占比${weight.toFixed(1)}%，超过${thresholds.maxWeight}%阈值`,
        })
      }

      // 止损预警
      if (p.stopPrice && p.currentPrice <= p.stopPrice) {
        warnings.push({
          stockCode: p.stockCode,
          stockName: p.stockName,
          warningType: 'STOP_LOSS',
          currentValue: p.currentPrice,
          threshold: p.stopPrice,
          message: `${p.stockName}当前价${p.currentPrice}已触及止损价${p.stopPrice}`,
        })
      }

      // 止盈预警
      if (p.targetPrice && p.currentPrice >= p.targetPrice) {
        warnings.push({
          stockCode: p.stockCode,
          stockName: p.stockName,
          warningType: 'TAKE_PROFIT',
          currentValue: p.currentPrice,
          threshold: p.targetPrice,
          message: `${p.stockName}当前价${p.currentPrice}已达到目标价${p.targetPrice}`,
        })
      }

      // 大幅亏损预警
      if (p.profitRate < thresholds.stopLossPercent) {
        warnings.push({
          stockCode: p.stockCode,
          stockName: p.stockName,
          warningType: 'HIGH_LOSS',
          currentValue: p.profitRate,
          threshold: thresholds.stopLossPercent,
          message: `${p.stockName}亏损${p.profitRate.toFixed(1)}%，超过${Math.abs(thresholds.stopLossPercent)}%阈值`,
        })
      }
    })

    return warnings
  },
}
