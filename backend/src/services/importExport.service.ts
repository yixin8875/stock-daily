import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface TradeImportRow {
  date: string;
  stockCode: string;
  stockName: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  amount?: number;
  commission?: number;
  note?: string;
}

class ImportExportService {
  // 解析 CSV 内容
  parseCSV(content: string): TradeImportRow[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows: TradeImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = this.mapRowToTrade(headers, values);
      if (row) rows.push(row);
    }

    return rows;
  }

  // 解析 Excel 文件
  parseExcel(buffer: Buffer): TradeImportRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    return data.map((row: Record<string, any>) => ({
      date: String(row['日期'] || row['date'] || ''),
      stockCode: String(row['股票代码'] || row['stockCode'] || ''),
      stockName: String(row['股票名称'] || row['stockName'] || ''),
      type: (String(row['类型'] || row['type'] || '').toLowerCase() === 'sell' ? 'sell' : 'buy') as 'buy' | 'sell',
      price: parseFloat(row['价格'] || row['price'] || 0),
      quantity: parseInt(row['数量'] || row['quantity'] || 0),
      amount: parseFloat(row['金额'] || row['amount'] || 0),
      commission: parseFloat(row['手续费'] || row['commission'] || 0),
      note: String(row['备注'] || row['note'] || ''),
    })).filter(r => r.stockCode && r.price > 0);
  }

  private mapRowToTrade(headers: string[], values: string[]): TradeImportRow | null {
    const map: Record<string, string> = {};
    headers.forEach((h, i) => { map[h] = values[i] || ''; });

    const stockCode = map['股票代码'] || map['stockCode'] || '';
    if (!stockCode) return null;

    return {
      date: map['日期'] || map['date'] || '',
      stockCode,
      stockName: map['股票名称'] || map['stockName'] || '',
      type: (map['类型'] || map['type'] || '').toLowerCase() === 'sell' ? 'sell' : 'buy',
      price: parseFloat(map['价格'] || map['price'] || '0'),
      quantity: parseInt(map['数量'] || map['quantity'] || '0'),
      amount: parseFloat(map['金额'] || map['amount'] || '0'),
      commission: parseFloat(map['手续费'] || map['commission'] || '0'),
      note: map['备注'] || map['note'] || '',
    };
  }

  // 导入交易记录
  async importTrades(userId: string, rows: TradeImportRow[]): Promise<ImportResult> {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    // 按日期分组
    const groupedByDate = new Map<string, TradeImportRow[]>();
    for (const row of rows) {
      const dateKey = row.date.split('T')[0];
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, []);
      }
      groupedByDate.get(dateKey)!.push(row);
    }

    for (const [dateStr, trades] of groupedByDate) {
      try {
        // 获取或创建当天的 Diary
        let diary = await prisma.diary.findFirst({
          where: { userId, date: new Date(dateStr) },
        });

        if (!diary) {
          diary = await prisma.diary.create({
            data: { userId, date: new Date(dateStr) },
          });
        }

        // 创建交易记录
        for (const row of trades) {
          await prisma.trade.create({
            data: {
              diaryId: diary.id,
              stockCode: row.stockCode,
              stockName: row.stockName,
              direction: row.type === 'buy' ? 'BUY' : 'SELL',
              price: row.price,
              quantity: row.quantity,
              amount: row.amount || row.price * row.quantity,
            },
          });
          result.success++;
        }
      } catch (error) {
        result.failed += trades.length;
        result.errors.push(`日期 ${dateStr}: ${(error as Error).message}`);
      }
    }

    return result;
  }

  // 导出交易记录为 CSV
  async exportTradesToCSV(userId: string): Promise<string> {
    const diaries = await prisma.diary.findMany({
      where: { userId },
      include: { trades: true },
      orderBy: { date: 'desc' },
    });

    const headers = ['日期', '股票代码', '股票名称', '类型', '价格', '数量', '金额'];
    const rows: string[] = [];

    for (const diary of diaries) {
      for (const t of diary.trades) {
        rows.push([
          diary.date.toISOString().split('T')[0],
          t.stockCode,
          t.stockName,
          t.direction,
          t.price,
          t.quantity,
          t.amount,
        ].join(','));
      }
    }

    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  }

  // 导出为 Excel
  async exportTradesToExcel(userId: string): Promise<Buffer> {
    const diaries = await prisma.diary.findMany({
      where: { userId },
      include: { trades: true },
      orderBy: { date: 'desc' },
    });

    const data: Record<string, any>[] = [];
    for (const diary of diaries) {
      for (const t of diary.trades) {
        data.push({
          '日期': diary.date.toISOString().split('T')[0],
          '股票代码': t.stockCode,
          '股票名称': t.stockName,
          '类型': t.direction === 'BUY' ? '买入' : '卖出',
          '价格': t.price,
          '数量': t.quantity,
          '金额': t.amount,
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '交易记录');

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  // 导出持仓数据为 CSV
  async exportPositionsToCSV(userId: string): Promise<string> {
    const positions = await prisma.position.findMany({
      where: { userId },
      orderBy: { stockCode: 'asc' },
    });

    const headers = ['股票代码', '股票名称', '持仓数量', '成本价', '总成本', '行业', '目标价', '止损价'];
    const rows = positions.map(p => [
      p.stockCode,
      p.stockName,
      p.quantity,
      p.costPrice,
      p.totalCost,
      p.industry || '',
      p.targetPrice || '',
      p.stopPrice || '',
    ].join(','));

    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  }

  // 导出自选股为 CSV
  async exportWatchlistToCSV(userId: string): Promise<string> {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['股票代码', '股票名称', '目标价', '止损价', '备注', '添加时间'];
    const rows = watchlist.map(w => [
      w.stockCode,
      w.stockName,
      w.targetPrice || '',
      w.stopPrice || '',
      w.notes || '',
      w.createdAt.toISOString().split('T')[0],
    ].join(','));

    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  }

  // 导出完整数据为 Excel（多 Sheet）
  async exportAllDataToExcel(userId: string): Promise<Buffer> {
    const wb = XLSX.utils.book_new();

    // 交易记录
    const diaries = await prisma.diary.findMany({
      where: { userId },
      include: { trades: true },
      orderBy: { date: 'desc' },
    });

    const tradesData: Record<string, any>[] = [];
    for (const diary of diaries) {
      for (const t of diary.trades) {
        tradesData.push({
          '日期': diary.date.toISOString().split('T')[0],
          '股票代码': t.stockCode,
          '股票名称': t.stockName,
          '类型': t.direction === 'BUY' ? '买入' : '卖出',
          '价格': Number(t.price),
          '数量': t.quantity,
          '金额': Number(t.amount),
        });
      }
    }
    const tradesSheet = XLSX.utils.json_to_sheet(tradesData);
    XLSX.utils.book_append_sheet(wb, tradesSheet, '交易记录');

    // 持仓数据
    const positions = await prisma.position.findMany({ where: { userId } });
    const positionsData = positions.map(p => ({
      '股票代码': p.stockCode,
      '股票名称': p.stockName,
      '持仓数量': p.quantity,
      '成本价': Number(p.costPrice),
      '总成本': Number(p.totalCost),
      '行业': p.industry || '',
    }));
    const positionsSheet = XLSX.utils.json_to_sheet(positionsData);
    XLSX.utils.book_append_sheet(wb, positionsSheet, '持仓');

    // 自选股
    const watchlist = await prisma.watchlist.findMany({ where: { userId } });
    const watchlistData = watchlist.map(w => ({
      '股票代码': w.stockCode,
      '股票名称': w.stockName,
      '目标价': w.targetPrice ? Number(w.targetPrice) : '',
      '止损价': w.stopPrice ? Number(w.stopPrice) : '',
      '备注': w.notes || '',
    }));
    const watchlistSheet = XLSX.utils.json_to_sheet(watchlistData);
    XLSX.utils.book_append_sheet(wb, watchlistSheet, '自选股');

    logger.info(`Exported all data for user ${userId}`);
    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }
}

export const importExportService = new ImportExportService();
