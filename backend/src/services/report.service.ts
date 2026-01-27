import { prisma } from '../app';

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
}

export interface ProfitSummary {
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  profitRate: number;
  winRate: number;
  tradingDays: number;
}

export interface StockPerformance {
  stockCode: string;
  stockName: string;
  profit: number;
  profitRate: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
}

export interface EmotionStats {
  emotion: string;
  count: number;
  avgProfit: number;
}

export interface DailyProfit {
  date: string;
  profit: number;
  profitRate: number;
}

export interface LearningItem {
  category: string;
  content: string;
  date: string;
}

export interface ReflectionItem {
  type: 'good' | 'bad' | 'improve';
  content: string;
  date: string;
}

export interface PeriodReport {
  period: 'week' | 'month';
  startDate: string;
  endDate: string;
  profitSummary: ProfitSummary;
  stockPerformance: StockPerformance[];
  emotionStats: EmotionStats[];
  dailyProfits: DailyProfit[];
  learnings: LearningItem[];
  reflections: ReflectionItem[];
}

export class ReportService {
  /**
   * 获取周报或月报
   */
  static async getReport(
    userId: string,
    period: 'week' | 'month',
    date: Date
  ): Promise<PeriodReport> {
    const { startDate, endDate } = this.getDateRange(date, period);

    const diaries = await prisma.diary.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        trades: true,
      },
      orderBy: { date: 'asc' },
    });

    // 计算盈亏汇总
    const profitSummary = this.calculateProfitSummary(diaries);

    // 计算股票表现
    const stockPerformance = this.calculateStockPerformance(diaries);

    // 计算情绪统计
    const emotionStats = this.calculateEmotionStats(diaries);

    // 每日盈亏
    const dailyProfits = this.calculateDailyProfits(diaries);

    // 学习笔记
    const learnings = this.extractLearnings(diaries);

    // 反思总结
    const reflections = this.extractReflections(diaries);

    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      profitSummary,
      stockPerformance,
      emotionStats,
      dailyProfits,
      learnings,
      reflections,
    };
  }

  /**
   * 获取日期范围
   */
  private static getDateRange(date: Date, period: 'week' | 'month'): ReportDateRange {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    if (period === 'week') {
      // 获取本周一和周日
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const startDate = new Date(d.setDate(diff));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
    } else {
      // 获取本月第一天和最后一天
      const startDate = new Date(d.getFullYear(), d.getMonth(), 1);
      const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }
  }

  /**
   * 计算盈亏汇总
   */
  private static calculateProfitSummary(diaries: any[]): ProfitSummary {
    let totalProfit = 0;
    let totalLoss = 0;
    let winDays = 0;
    let lossDays = 0;
    let tradingDays = 0;

    for (const diary of diaries) {
      if (diary.profitLossAmount !== null) {
        const amount = Number(diary.profitLossAmount);
        tradingDays++;
        if (amount > 0) {
          totalProfit += amount;
          winDays++;
        } else if (amount < 0) {
          totalLoss += Math.abs(amount);
          lossDays++;
        }
      }
    }

    const netProfit = totalProfit - totalLoss;
    const winRate = tradingDays > 0 ? (winDays / tradingDays) * 100 : 0;

    // 计算收益率（基于第一天的总资产）
    let profitRate = 0;
    const firstDiaryWithAssets = diaries.find(d => d.totalAssets !== null);
    if (firstDiaryWithAssets && Number(firstDiaryWithAssets.totalAssets) > 0) {
      profitRate = (netProfit / Number(firstDiaryWithAssets.totalAssets)) * 100;
    }

    return {
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalLoss: Math.round(totalLoss * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      profitRate: Math.round(profitRate * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      tradingDays,
    };
  }

  /**
   * 计算股票表现
   */
  private static calculateStockPerformance(diaries: any[]): StockPerformance[] {
    const stockMap = new Map<string, {
      stockName: string;
      buyAmount: number;
      sellAmount: number;
      buyQuantity: number;
      sellQuantity: number;
      tradeCount: number;
    }>();

    for (const diary of diaries) {
      for (const trade of diary.trades) {
        const existing = stockMap.get(trade.stockCode) || {
          stockName: trade.stockName,
          buyAmount: 0,
          sellAmount: 0,
          buyQuantity: 0,
          sellQuantity: 0,
          tradeCount: 0,
        };

        const price = Number(trade.price);
        const amount = price * trade.quantity;

        if (trade.direction === 'BUY') {
          existing.buyAmount += amount;
          existing.buyQuantity += trade.quantity;
        } else {
          existing.sellAmount += amount;
          existing.sellQuantity += trade.quantity;
        }
        existing.tradeCount++;

        stockMap.set(trade.stockCode, existing);
      }
    }

    const performances: StockPerformance[] = [];
    for (const [stockCode, data] of stockMap) {
      const avgBuyPrice = data.buyQuantity > 0 ? data.buyAmount / data.buyQuantity : 0;
      const profit = data.sellAmount - (avgBuyPrice * data.sellQuantity);
      const profitRate = data.buyAmount > 0 ? (profit / data.buyAmount) * 100 : 0;

      performances.push({
        stockCode,
        stockName: data.stockName,
        profit: Math.round(profit * 100) / 100,
        profitRate: Math.round(profitRate * 100) / 100,
        tradeCount: data.tradeCount,
        winCount: profit > 0 ? 1 : 0,
        lossCount: profit < 0 ? 1 : 0,
      });
    }

    return performances.sort((a, b) => b.profit - a.profit);
  }

  /**
   * 计算情绪统计
   */
  private static calculateEmotionStats(diaries: any[]): EmotionStats[] {
    const emotionMap = new Map<string, { count: number; totalProfit: number }>();

    for (const diary of diaries) {
      const emotions = [diary.emotionBefore, diary.emotionDuring, diary.emotionAfter].filter(Boolean);
      const profit = diary.profitLossAmount ? Number(diary.profitLossAmount) : 0;

      for (const emotion of emotions) {
        const existing = emotionMap.get(emotion) || { count: 0, totalProfit: 0 };
        existing.count++;
        existing.totalProfit += profit;
        emotionMap.set(emotion, existing);
      }
    }

    const stats: EmotionStats[] = [];
    for (const [emotion, data] of emotionMap) {
      stats.push({
        emotion,
        count: data.count,
        avgProfit: Math.round((data.totalProfit / data.count) * 100) / 100,
      });
    }

    return stats.sort((a, b) => b.count - a.count);
  }

  /**
   * 计算每日盈亏
   */
  private static calculateDailyProfits(diaries: any[]): DailyProfit[] {
    return diaries
      .filter(d => d.profitLossAmount !== null)
      .map(diary => ({
        date: diary.date.toISOString().split('T')[0],
        profit: Math.round(Number(diary.profitLossAmount) * 100) / 100,
        profitRate: diary.profitLossPercent
          ? Math.round(Number(diary.profitLossPercent) * 100) / 100
          : 0,
      }));
  }

  /**
   * 提取学习笔记
   */
  private static extractLearnings(diaries: any[]): LearningItem[] {
    return diaries
      .filter(d => d.learningNote)
      .map(diary => ({
        category: diary.learningCategory || 'OTHER',
        content: diary.learningNote,
        date: diary.date.toISOString().split('T')[0],
      }));
  }

  /**
   * 提取反思总结
   */
  private static extractReflections(diaries: any[]): ReflectionItem[] {
    const reflections: ReflectionItem[] = [];

    for (const diary of diaries) {
      const date = diary.date.toISOString().split('T')[0];

      if (diary.reflectionGood) {
        reflections.push({
          type: 'good',
          content: diary.reflectionGood,
          date,
        });
      }
      if (diary.reflectionBad) {
        reflections.push({
          type: 'bad',
          content: diary.reflectionBad,
          date,
        });
      }
      if (diary.reflectionImprove) {
        reflections.push({
          type: 'improve',
          content: diary.reflectionImprove,
          date,
        });
      }
    }

    return reflections;
  }

  /**
   * 获取报告列表（最近的周报/月报）
   */
  static async getReportList(
    userId: string,
    period: 'week' | 'month',
    limit: number = 10
  ): Promise<Array<{ startDate: string; endDate: string; netProfit: number; tradingDays: number }>> {
    const reports: Array<{ startDate: string; endDate: string; netProfit: number; tradingDays: number }> = [];
    const now = new Date();

    for (let i = 0; i < limit; i++) {
      const date = new Date(now);
      if (period === 'week') {
        date.setDate(date.getDate() - i * 7);
      } else {
        date.setMonth(date.getMonth() - i);
      }

      const { startDate, endDate } = this.getDateRange(date, period);

      const diaries = await prisma.diary.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          profitLossAmount: true,
        },
      });

      if (diaries.length > 0) {
        let netProfit = 0;
        for (const diary of diaries) {
          if (diary.profitLossAmount !== null) {
            netProfit += Number(diary.profitLossAmount);
          }
        }

        reports.push({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          netProfit: Math.round(netProfit * 100) / 100,
          tradingDays: diaries.length,
        });
      }
    }

    return reports;
  }

  /**
   * 导出报告为 Excel
   */
  static async exportReport(
    userId: string,
    period: 'week' | 'month',
    date: Date
  ): Promise<Buffer> {
    const ExcelJS = await import('exceljs');
    const report = await this.getReport(userId, period, date);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Stock Daily';
    workbook.created = new Date();

    // 概览页
    const summarySheet = workbook.addWorksheet('收益概览');
    summarySheet.columns = [
      { header: '指标', key: 'metric', width: 20 },
      { header: '数值', key: 'value', width: 20 },
    ];
    summarySheet.addRows([
      { metric: '报告周期', value: `${report.startDate} ~ ${report.endDate}` },
      { metric: '净收益', value: `${report.profitSummary.netProfit} 元` },
      { metric: '总盈利', value: `${report.profitSummary.totalProfit} 元` },
      { metric: '总亏损', value: `${report.profitSummary.totalLoss} 元` },
      { metric: '收益率', value: `${report.profitSummary.profitRate}%` },
      { metric: '胜率', value: `${report.profitSummary.winRate}%` },
      { metric: '交易天数', value: `${report.profitSummary.tradingDays} 天` },
    ]);
    this.styleHeaderRow(summarySheet);

    // 股票表现页
    const stockSheet = workbook.addWorksheet('股票表现');
    stockSheet.columns = [
      { header: '股票代码', key: 'stockCode', width: 12 },
      { header: '股票名称', key: 'stockName', width: 15 },
      { header: '收益(元)', key: 'profit', width: 12 },
      { header: '收益率(%)', key: 'profitRate', width: 12 },
      { header: '交易次数', key: 'tradeCount', width: 10 },
    ];
    stockSheet.addRows(report.stockPerformance.map(s => ({
      stockCode: s.stockCode,
      stockName: s.stockName,
      profit: s.profit,
      profitRate: s.profitRate,
      tradeCount: s.tradeCount,
    })));
    this.styleHeaderRow(stockSheet);

    // 每日盈亏页
    const dailySheet = workbook.addWorksheet('每日盈亏');
    dailySheet.columns = [
      { header: '日期', key: 'date', width: 15 },
      { header: '盈亏(元)', key: 'profit', width: 15 },
      { header: '盈亏率(%)', key: 'profitRate', width: 15 },
    ];
    dailySheet.addRows(report.dailyProfits);
    this.styleHeaderRow(dailySheet);

    // 情绪分析页
    if (report.emotionStats.length > 0) {
      const emotionSheet = workbook.addWorksheet('情绪分析');
      emotionSheet.columns = [
        { header: '情绪', key: 'emotion', width: 15 },
        { header: '出现次数', key: 'count', width: 12 },
        { header: '平均盈亏(元)', key: 'avgProfit', width: 15 },
      ];
      emotionSheet.addRows(report.emotionStats);
      this.styleHeaderRow(emotionSheet);
    }

    // 学习笔记页
    if (report.learnings.length > 0) {
      const learningSheet = workbook.addWorksheet('学习笔记');
      learningSheet.columns = [
        { header: '日期', key: 'date', width: 12 },
        { header: '分类', key: 'category', width: 12 },
        { header: '内容', key: 'content', width: 60 },
      ];
      learningSheet.addRows(report.learnings);
      this.styleHeaderRow(learningSheet);
    }

    // 反思总结页
    if (report.reflections.length > 0) {
      const reflectionSheet = workbook.addWorksheet('反思总结');
      reflectionSheet.columns = [
        { header: '日期', key: 'date', width: 12 },
        { header: '类型', key: 'type', width: 12 },
        { header: '内容', key: 'content', width: 60 },
      ];
      const typeLabels: Record<string, string> = {
        good: '做得好',
        bad: '需改进',
        improve: '改进计划',
      };
      reflectionSheet.addRows(report.reflections.map(r => ({
        date: r.date,
        type: typeLabels[r.type] || r.type,
        content: r.content,
      })));
      this.styleHeaderRow(reflectionSheet);
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * 设置表头样式
   */
  private static styleHeaderRow(sheet: any): void {
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  }
}
