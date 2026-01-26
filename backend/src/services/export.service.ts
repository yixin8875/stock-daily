import { prisma } from '../app';

export interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
}

export interface DiaryExportData {
  id: string;
  date: string;
  marketTrend: string | null;
  marketVolume: string | null;
  marketComment: string | null;
  hotSectors: string[];
  profitLossAmount: number | null;
  profitLossPercent: number | null;
  totalAssets: number | null;
  reflectionGood: string | null;
  reflectionBad: string | null;
  reflectionImprove: string | null;
  reflectionTags: string[];
  emotionBefore: string | null;
  emotionDuring: string | null;
  emotionAfter: string | null;
  emotionNote: string | null;
  learningNote: string | null;
  learningCategory: string | null;
  riskNotes: string | null;
  trades: any[];
  watchStocks: any[];
  buyPlans: any[];
  sellPlans: any[];
  stopLosses: any[];
  createdAt: string;
  updatedAt: string;
}

export class ExportService {
  /**
   * Get all diaries for export with optional date range filter
   */
  static async getDiariesForExport(
    userId: string,
    options: ExportOptions = {}
  ): Promise<DiaryExportData[]> {
    const whereClause: any = { userId };

    if (options.startDate || options.endDate) {
      whereClause.date = {};
      if (options.startDate) {
        whereClause.date.gte = options.startDate;
      }
      if (options.endDate) {
        whereClause.date.lte = options.endDate;
      }
    }

    const diaries = await prisma.diary.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        trades: true,
        watchStocks: true,
        buyPlans: true,
        sellPlans: true,
        stopLosses: true,
      },
    });

    return diaries.map((diary) => ({
      id: diary.id,
      date: diary.date.toISOString().split('T')[0],
      marketTrend: diary.marketTrend,
      marketVolume: diary.marketVolume,
      marketComment: diary.marketComment,
      hotSectors: diary.hotSectors || [],
      profitLossAmount: diary.profitLossAmount ? Number(diary.profitLossAmount) : null,
      profitLossPercent: diary.profitLossPercent ? Number(diary.profitLossPercent) : null,
      totalAssets: diary.totalAssets ? Number(diary.totalAssets) : null,
      reflectionGood: diary.reflectionGood,
      reflectionBad: diary.reflectionBad,
      reflectionImprove: diary.reflectionImprove,
      reflectionTags: diary.reflectionTags || [],
      emotionBefore: diary.emotionBefore,
      emotionDuring: diary.emotionDuring,
      emotionAfter: diary.emotionAfter,
      emotionNote: diary.emotionNote,
      learningNote: diary.learningNote,
      learningCategory: diary.learningCategory,
      riskNotes: diary.riskNotes,
      trades: diary.trades,
      watchStocks: diary.watchStocks,
      buyPlans: diary.buyPlans,
      sellPlans: diary.sellPlans,
      stopLosses: diary.stopLosses,
      createdAt: diary.createdAt.toISOString(),
      updatedAt: diary.updatedAt.toISOString(),
    }));
  }

  /**
   * Export diaries as JSON format
   */
  static async exportAsJson(
    userId: string,
    options: ExportOptions = {}
  ): Promise<string> {
    const diaries = await this.getDiariesForExport(userId, options);

    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: diaries.length,
      dateRange: {
        startDate: options.startDate?.toISOString().split('T')[0] || null,
        endDate: options.endDate?.toISOString().split('T')[0] || null,
      },
      diaries,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export diaries as CSV format with UTF-8 BOM for Chinese support
   */
  static async exportAsCsv(
    userId: string,
    options: ExportOptions = {}
  ): Promise<string> {
    const diaries = await this.getDiariesForExport(userId, options);

    // CSV headers
    const headers = [
      '日期',
      '市场趋势',
      '成交量',
      '市场评论',
      '热门板块',
      '盈亏金额',
      '盈亏比例(%)',
      '总资产',
      '做得好的',
      '做得不好的',
      '改进计划',
      '反思标签',
      '交易前情绪',
      '交易中情绪',
      '交易后情绪',
      '情绪备注',
      '学习笔记',
      '学习分类',
      '风险备注',
      '交易数量',
      '关注股票数',
      '买入计划数',
      '卖出计划数',
      '止损计划数',
      '创建时间',
      '更新时间',
    ];

    // Helper function to escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const str = String(value);
      // If contains comma, newline, or double quote, wrap in quotes
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV rows
    const rows = diaries.map((diary) => [
      escapeCSV(diary.date),
      escapeCSV(diary.marketTrend),
      escapeCSV(diary.marketVolume),
      escapeCSV(diary.marketComment),
      escapeCSV(diary.hotSectors.join('; ')),
      escapeCSV(diary.profitLossAmount),
      escapeCSV(diary.profitLossPercent),
      escapeCSV(diary.totalAssets),
      escapeCSV(diary.reflectionGood),
      escapeCSV(diary.reflectionBad),
      escapeCSV(diary.reflectionImprove),
      escapeCSV(diary.reflectionTags.join('; ')),
      escapeCSV(diary.emotionBefore),
      escapeCSV(diary.emotionDuring),
      escapeCSV(diary.emotionAfter),
      escapeCSV(diary.emotionNote),
      escapeCSV(diary.learningNote),
      escapeCSV(diary.learningCategory),
      escapeCSV(diary.riskNotes),
      escapeCSV(diary.trades.length),
      escapeCSV(diary.watchStocks.length),
      escapeCSV(diary.buyPlans.length),
      escapeCSV(diary.sellPlans.length),
      escapeCSV(diary.stopLosses.length),
      escapeCSV(diary.createdAt),
      escapeCSV(diary.updatedAt),
    ]);

    // UTF-8 BOM for Excel Chinese support
    const BOM = '\uFEFF';
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return BOM + csvContent;
  }
}
