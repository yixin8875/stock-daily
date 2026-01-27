import { prisma } from '../app';
import ExcelJS from 'exceljs';

export interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
}

export type TradeExportType = 'detail' | 'summary' | 'analysis';
export type ExportFormat = 'excel' | 'csv' | 'json';

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

  /**
   * 获取交易数据
   */
  private static async getTradesForExport(
    userId: string,
    options: ExportOptions = {},
    stockCode?: string
  ) {
    const whereClause: any = {
      diary: { userId },
    };

    if (options.startDate || options.endDate) {
      whereClause.diary.date = {};
      if (options.startDate) {
        whereClause.diary.date.gte = options.startDate;
      }
      if (options.endDate) {
        whereClause.diary.date.lte = options.endDate;
      }
    }

    if (stockCode) {
      whereClause.stockCode = stockCode;
    }

    return prisma.trade.findMany({
      where: whereClause,
      include: {
        diary: {
          select: {
            date: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 导出交易明细
   */
  static async exportTradeDetail(
    userId: string,
    options: ExportOptions = {},
    format: ExportFormat = 'excel',
    stockCode?: string
  ): Promise<Buffer | string> {
    const trades = await this.getTradesForExport(userId, options, stockCode);

    const data = trades.map(trade => ({
      date: trade.diary.date.toISOString().split('T')[0],
      stockCode: trade.stockCode,
      stockName: trade.stockName,
      direction: trade.direction === 'BUY' ? '买入' : '卖出',
      price: Number(trade.price),
      quantity: trade.quantity,
      amount: Number(trade.amount),
      reason: trade.reason || '',
      strategyTag: trade.strategyTag || '',
    }));

    if (format === 'json') {
      return JSON.stringify({ trades: data, total: data.length }, null, 2);
    }

    if (format === 'csv') {
      return this.tradesToCsv(data);
    }

    return this.tradesToExcel(data, '交易明细');
  }

  /**
   * 导出股票汇总
   */
  static async exportTradeSummary(
    userId: string,
    options: ExportOptions = {},
    format: ExportFormat = 'excel'
  ): Promise<Buffer | string> {
    const trades = await this.getTradesForExport(userId, options);

    // 按股票汇总
    const stockMap = new Map<string, {
      stockName: string;
      buyCount: number;
      sellCount: number;
      totalBuyAmount: number;
      totalSellAmount: number;
      totalBuyQuantity: number;
      totalSellQuantity: number;
    }>();

    for (const trade of trades) {
      const existing = stockMap.get(trade.stockCode) || {
        stockName: trade.stockName,
        buyCount: 0,
        sellCount: 0,
        totalBuyAmount: 0,
        totalSellAmount: 0,
        totalBuyQuantity: 0,
        totalSellQuantity: 0,
      };

      const price = Number(trade.price);
      const amount = price * trade.quantity;

      if (trade.direction === 'BUY') {
        existing.buyCount++;
        existing.totalBuyAmount += amount;
        existing.totalBuyQuantity += trade.quantity;
      } else {
        existing.sellCount++;
        existing.totalSellAmount += amount;
        existing.totalSellQuantity += trade.quantity;
      }

      stockMap.set(trade.stockCode, existing);
    }

    const data = Array.from(stockMap.entries()).map(([stockCode, stat]) => {
      const avgBuyPrice = stat.totalBuyQuantity > 0 ? stat.totalBuyAmount / stat.totalBuyQuantity : 0;
      const avgSellPrice = stat.totalSellQuantity > 0 ? stat.totalSellAmount / stat.totalSellQuantity : 0;
      const realizedProfit = stat.totalSellAmount - (avgBuyPrice * stat.totalSellQuantity);
      const holdingQuantity = stat.totalBuyQuantity - stat.totalSellQuantity;

      return {
        stockCode,
        stockName: stat.stockName,
        buyCount: stat.buyCount,
        sellCount: stat.sellCount,
        totalBuyAmount: Math.round(stat.totalBuyAmount * 100) / 100,
        totalSellAmount: Math.round(stat.totalSellAmount * 100) / 100,
        avgBuyPrice: Math.round(avgBuyPrice * 100) / 100,
        avgSellPrice: Math.round(avgSellPrice * 100) / 100,
        realizedProfit: Math.round(realizedProfit * 100) / 100,
        holdingQuantity,
      };
    });

    if (format === 'json') {
      return JSON.stringify({ summary: data, total: data.length }, null, 2);
    }

    if (format === 'csv') {
      return this.summaryToCsv(data);
    }

    return this.summaryToExcel(data);
  }

  /**
   * 导出收益分析
   */
  static async exportTradeAnalysis(
    userId: string,
    options: ExportOptions = {},
    format: ExportFormat = 'excel'
  ): Promise<Buffer | string> {
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
      select: {
        date: true,
        profitLossAmount: true,
        profitLossPercent: true,
        totalAssets: true,
      },
      orderBy: { date: 'asc' },
    });

    let cumulativeProfit = 0;
    let winDays = 0;
    let lossDays = 0;
    let maxProfit = 0;
    let maxLoss = 0;

    const data = diaries.map(diary => {
      const profit = diary.profitLossAmount ? Number(diary.profitLossAmount) : 0;
      const profitRate = diary.profitLossPercent ? Number(diary.profitLossPercent) : 0;
      cumulativeProfit += profit;

      if (profit > 0) {
        winDays++;
        if (profit > maxProfit) maxProfit = profit;
      } else if (profit < 0) {
        lossDays++;
        if (Math.abs(profit) > maxLoss) maxLoss = Math.abs(profit);
      }

      return {
        date: diary.date.toISOString().split('T')[0],
        profit: Math.round(profit * 100) / 100,
        profitRate: Math.round(profitRate * 100) / 100,
        cumulativeProfit: Math.round(cumulativeProfit * 100) / 100,
        totalAssets: diary.totalAssets ? Math.round(Number(diary.totalAssets) * 100) / 100 : null,
      };
    });

    const totalDays = winDays + lossDays;
    const winRate = totalDays > 0 ? (winDays / totalDays) * 100 : 0;

    const analysis = {
      dailyData: data,
      summary: {
        totalDays,
        winDays,
        lossDays,
        winRate: Math.round(winRate * 100) / 100,
        totalProfit: Math.round(cumulativeProfit * 100) / 100,
        maxProfit: Math.round(maxProfit * 100) / 100,
        maxLoss: Math.round(maxLoss * 100) / 100,
      },
    };

    if (format === 'json') {
      return JSON.stringify(analysis, null, 2);
    }

    if (format === 'csv') {
      return this.analysisToCsv(data, analysis.summary);
    }

    return this.analysisToExcel(data, analysis.summary);
  }

  /**
   * 统一导出交易数据入口
   */
  static async exportTrades(
    userId: string,
    exportType: TradeExportType,
    options: ExportOptions = {},
    format: ExportFormat = 'excel',
    stockCode?: string
  ): Promise<Buffer | string> {
    switch (exportType) {
      case 'detail':
        return this.exportTradeDetail(userId, options, format, stockCode);
      case 'summary':
        return this.exportTradeSummary(userId, options, format);
      case 'analysis':
        return this.exportTradeAnalysis(userId, options, format);
      default:
        return this.exportTradeDetail(userId, options, format, stockCode);
    }
  }

  // ============ 私有辅助方法 ============

  /**
   * 交易明细转CSV
   */
  private static tradesToCsv(data: any[]): string {
    const headers = ['日期', '股票代码', '股票名称', '方向', '价格', '数量', '金额', '交易理由', '策略标签'];
    const BOM = '\uFEFF';

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = data.map(row => [
      escapeCSV(row.date),
      escapeCSV(row.stockCode),
      escapeCSV(row.stockName),
      escapeCSV(row.direction),
      escapeCSV(row.price),
      escapeCSV(row.quantity),
      escapeCSV(row.amount),
      escapeCSV(row.reason),
      escapeCSV(row.strategyTag),
    ]);

    return BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * 交易明细转Excel
   */
  private static async tradesToExcel(data: any[], sheetName: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = [
      { header: '日期', key: 'date', width: 12 },
      { header: '股票代码', key: 'stockCode', width: 12 },
      { header: '股票名称', key: 'stockName', width: 15 },
      { header: '方向', key: 'direction', width: 8 },
      { header: '价格', key: 'price', width: 12 },
      { header: '数量', key: 'quantity', width: 10 },
      { header: '金额', key: 'amount', width: 15 },
      { header: '交易理由', key: 'reason', width: 30 },
      { header: '策略标签', key: 'strategyTag', width: 15 },
    ];

    // 设置表头样式
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    data.forEach(row => sheet.addRow(row));

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * 股票汇总转CSV
   */
  private static summaryToCsv(data: any[]): string {
    const headers = ['股票代码', '股票名称', '买入次数', '卖出次数', '买入总额', '卖出总额', '平均买入价', '平均卖出价', '已实现盈亏', '持仓数量'];
    const BOM = '\uFEFF';

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = data.map(row => [
      escapeCSV(row.stockCode),
      escapeCSV(row.stockName),
      escapeCSV(row.buyCount),
      escapeCSV(row.sellCount),
      escapeCSV(row.totalBuyAmount),
      escapeCSV(row.totalSellAmount),
      escapeCSV(row.avgBuyPrice),
      escapeCSV(row.avgSellPrice),
      escapeCSV(row.realizedProfit),
      escapeCSV(row.holdingQuantity),
    ]);

    return BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * 股票汇总转Excel
   */
  private static async summaryToExcel(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('股票汇总');

    sheet.columns = [
      { header: '股票代码', key: 'stockCode', width: 12 },
      { header: '股票名称', key: 'stockName', width: 15 },
      { header: '买入次数', key: 'buyCount', width: 10 },
      { header: '卖出次数', key: 'sellCount', width: 10 },
      { header: '买入总额', key: 'totalBuyAmount', width: 15 },
      { header: '卖出总额', key: 'totalSellAmount', width: 15 },
      { header: '平均买入价', key: 'avgBuyPrice', width: 12 },
      { header: '平均卖出价', key: 'avgSellPrice', width: 12 },
      { header: '已实现盈亏', key: 'realizedProfit', width: 15 },
      { header: '持仓数量', key: 'holdingQuantity', width: 10 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    data.forEach(row => sheet.addRow(row));

    // 盈亏列条件格式
    const profitCol = 9;
    data.forEach((row, index) => {
      const cell = sheet.getCell(index + 2, profitCol);
      if (row.realizedProfit > 0) {
        cell.font = { color: { argb: 'FF008000' } };
      } else if (row.realizedProfit < 0) {
        cell.font = { color: { argb: 'FFFF0000' } };
      }
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * 收益分析转CSV
   */
  private static analysisToCsv(data: any[], summary: any): string {
    const BOM = '\uFEFF';
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 汇总信息
    const summaryLines = [
      '收益分析汇总',
      `交易天数,${summary.totalDays}`,
      `盈利天数,${summary.winDays}`,
      `亏损天数,${summary.lossDays}`,
      `胜率(%),${summary.winRate}`,
      `总盈亏,${summary.totalProfit}`,
      `最大单日盈利,${summary.maxProfit}`,
      `最大单日亏损,${summary.maxLoss}`,
      '',
      '每日明细',
    ];

    const headers = ['日期', '当日盈亏', '盈亏比例(%)', '累计盈亏', '总资产'];
    const rows = data.map(row => [
      escapeCSV(row.date),
      escapeCSV(row.profit),
      escapeCSV(row.profitRate),
      escapeCSV(row.cumulativeProfit),
      escapeCSV(row.totalAssets),
    ]);

    return BOM + [...summaryLines, headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * 收益分析转Excel
   */
  private static async analysisToExcel(data: any[], summary: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // 汇总表
    const summarySheet = workbook.addWorksheet('收益汇总');
    summarySheet.columns = [
      { header: '指标', key: 'metric', width: 20 },
      { header: '数值', key: 'value', width: 15 },
    ];
    summarySheet.getRow(1).font = { bold: true };

    summarySheet.addRows([
      { metric: '交易天数', value: summary.totalDays },
      { metric: '盈利天数', value: summary.winDays },
      { metric: '亏损天数', value: summary.lossDays },
      { metric: '胜率(%)', value: summary.winRate },
      { metric: '总盈亏', value: summary.totalProfit },
      { metric: '最大单日盈利', value: summary.maxProfit },
      { metric: '最大单日亏损', value: summary.maxLoss },
    ]);

    // 每日明细表
    const detailSheet = workbook.addWorksheet('每日明细');
    detailSheet.columns = [
      { header: '日期', key: 'date', width: 12 },
      { header: '当日盈亏', key: 'profit', width: 12 },
      { header: '盈亏比例(%)', key: 'profitRate', width: 12 },
      { header: '累计盈亏', key: 'cumulativeProfit', width: 15 },
      { header: '总资产', key: 'totalAssets', width: 15 },
    ];
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    data.forEach(row => detailSheet.addRow(row));

    // 盈亏列条件格式
    data.forEach((row, index) => {
      const cell = detailSheet.getCell(index + 2, 2);
      if (row.profit > 0) {
        cell.font = { color: { argb: 'FF008000' } };
      } else if (row.profit < 0) {
        cell.font = { color: { argb: 'FFFF0000' } };
      }
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
