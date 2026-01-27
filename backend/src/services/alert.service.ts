import { PrismaClient, AlertType } from '@prisma/client';

const prisma = new PrismaClient();

export interface AlertInput {
  positionId?: string;
  stockCode: string;
  stockName: string;
  alertType: AlertType;
  targetPrice: number;
  notes?: string;
}

export class AlertService {
  /**
   * 获取用户所有提醒
   */
  static async getAlerts(userId: string, includeTriggered = false) {
    return prisma.priceAlert.findMany({
      where: {
        userId,
        ...(includeTriggered ? {} : { isTriggered: false }),
      },
      include: { position: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 创建提醒
   */
  static async createAlert(userId: string, input: AlertInput) {
    return prisma.priceAlert.create({
      data: {
        userId,
        positionId: input.positionId,
        stockCode: input.stockCode,
        stockName: input.stockName,
        alertType: input.alertType,
        targetPrice: input.targetPrice,
        notes: input.notes,
      },
    });
  }

  /**
   * 更新提醒
   */
  static async updateAlert(
    userId: string,
    alertId: string,
    input: Partial<AlertInput & { isEnabled: boolean }>
  ) {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    return prisma.priceAlert.update({
      where: { id: alertId },
      data: input,
    });
  }

  /**
   * 删除提醒
   */
  static async deleteAlert(userId: string, alertId: string) {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    return prisma.priceAlert.delete({ where: { id: alertId } });
  }

  /**
   * 检查并触发提醒
   */
  static async checkAlerts(
    userId: string,
    quotes: { code: string; price: number }[]
  ) {
    const alerts = await prisma.priceAlert.findMany({
      where: {
        userId,
        isEnabled: true,
        isTriggered: false,
      },
    });

    const triggeredAlerts: any[] = [];

    for (const alert of alerts) {
      const quote = quotes.find(q => q.code === alert.stockCode);
      if (!quote) continue;

      let shouldTrigger = false;
      const targetPrice = Number(alert.targetPrice);

      switch (alert.alertType) {
        case 'TAKE_PROFIT':
        case 'PRICE_ABOVE':
          shouldTrigger = quote.price >= targetPrice;
          break;
        case 'STOP_LOSS':
        case 'PRICE_BELOW':
          shouldTrigger = quote.price <= targetPrice;
          break;
      }

      if (shouldTrigger) {
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            isTriggered: true,
            triggeredAt: new Date(),
          },
        });

        triggeredAlerts.push({
          ...alert,
          currentPrice: quote.price,
        });
      }
    }

    return triggeredAlerts;
  }

  /**
   * 重置已触发的提醒
   */
  static async resetAlert(userId: string, alertId: string) {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    return prisma.priceAlert.update({
      where: { id: alertId },
      data: {
        isTriggered: false,
        triggeredAt: null,
      },
    });
  }
}
