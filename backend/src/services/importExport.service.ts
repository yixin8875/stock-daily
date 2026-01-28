import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

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

    return data.map(row => ({
      date: String(row['日期'] || row['date'] || ''),
      stockCode: String(row['股票代码'] || row['stockCode'] || ''),
      stockName: String(row['股票名称'] || row['stockName'] || ''),
      type: (row['类型'] || row['type'] || '').toLowerCase() === 'sell' ? 'sell' : 'buy',
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

    for (const row of rows) {
      try {
        await prisma.trade.create({
          data: {
            userId,
            stockCode: row.stockCode,
            stockName: row.stockName,
            type: row.type,
            price: row.price,
            quantity: row.quantity,
            amount: row.amount || row.price * row.quantity,
            commission: row.commission || 0,
            tradeTime: new Date(row.date),
          },
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`行 ${row.stockCode}: ${(error as Error).message}`);
      }
    }

    return result;
  }

  // 导出交易记录为 CSV
  async exportTradesToCSV(userId: string): Promise<string> {
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { tradeTime: 'desc' },
    });

    const headers = ['日期', '股票代码', '股票名称', '类型', '价格', '数量', '金额', '手续费'];
    const rows = trades.map(t => [
      t.tradeTime.toISOString().split('T')[0],
      t.stockCode,
      t.stockName,
      t.type,
      t.price,
      t.quantity,
      t.amount,
      t.commission,
    ].join(','));

    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  }

  // 导出为 Excel
  async exportTradesToExcel(userId: string): Promise<Buffer> {
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { tradeTime: 'desc' },
    });

    const data = trades.map(t => ({
      '日期': t.tradeTime.toISOString().split('T')[0],
      '股票代码': t.stockCode,
      '股票名称': t.stockName,
      '类型': t.type === 'buy' ? '买入' : '卖出',
      '价格': t.price,
      '数量': t.quantity,
      '金额': t.amount,
      '手续费': t.commission,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '交易记录');

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }
}

export const importExportService = new ImportExportService();
