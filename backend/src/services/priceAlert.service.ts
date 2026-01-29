import { PrismaClient } from '@prisma/client';
import { AlertService } from './alert.service';
import { emailService } from './email.service';
import { wsService } from './websocket.service';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface PriceData {
  code: string;
  name: string;
  price: number;
}

export class PriceAlertService {
  // 检查所有用户的价格提醒
  static async checkAllAlerts(quotes: PriceData[]): Promise<void> {
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    for (const user of users) {
      await this.checkUserAlerts(user.id, user.email, quotes);
    }
  }

  // 检查单个用户的价格提醒
  static async checkUserAlerts(
    userId: string,
    userEmail: string,
    quotes: PriceData[]
  ): Promise<void> {
    const quotesForCheck = quotes.map(q => ({
      code: q.code,
      price: q.price,
    }));

    const triggered = await AlertService.checkAlerts(userId, quotesForCheck);

    for (const alert of triggered) {
      const quote = quotes.find(q => q.code === alert.stockCode);
      if (!quote) continue;

      // 发送 WebSocket 通知
      this.sendWebSocketNotification(userId, alert, quote);

      // 发送邮件通知
      await this.sendEmailNotification(userEmail, alert, quote);

      logger.info(
        `Alert triggered: ${alert.stockName} ${alert.alertType} at ${quote.price}`
      );
    }
  }

  // 发送 WebSocket 通知
  private static sendWebSocketNotification(
    userId: string,
    alert: any,
    quote: PriceData
  ): void {
    wsService.sendToUser(userId, {
      type: 'price_alert',
      data: {
        alertId: alert.id,
        stockCode: alert.stockCode,
        stockName: alert.stockName,
        alertType: alert.alertType,
        targetPrice: Number(alert.targetPrice),
        currentPrice: quote.price,
        triggeredAt: new Date().toISOString(),
      },
    });
  }

  // 发送邮件通知
  private static async sendEmailNotification(
    email: string,
    alert: any,
    quote: PriceData
  ): Promise<void> {
    await emailService.sendPriceAlert(email, {
      code: alert.stockCode,
      name: alert.stockName,
      price: quote.price,
      target: Number(alert.targetPrice),
    });
  }

  // 批量创建价格提醒
  static async createBatchAlerts(
    userId: string,
    alerts: Array<{
      stockCode: string;
      stockName: string;
      alertType: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'TAKE_PROFIT' | 'STOP_LOSS';
      targetPrice: number;
    }>
  ): Promise<number> {
    let created = 0;
    for (const alert of alerts) {
      await AlertService.createAlert(userId, alert);
      created++;
    }
    return created;
  }

  // 获取提醒统计
  static async getAlertStats(userId: string) {
    const [total, active, triggered] = await Promise.all([
      prisma.priceAlert.count({ where: { userId } }),
      prisma.priceAlert.count({
        where: { userId, isEnabled: true, isTriggered: false },
      }),
      prisma.priceAlert.count({ where: { userId, isTriggered: true } }),
    ]);

    return { total, active, triggered };
  }
}

export const priceAlertService = new PriceAlertService();
