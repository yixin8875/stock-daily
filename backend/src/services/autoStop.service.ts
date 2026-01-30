import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

export interface ConditionalOrder {
  id: string;
  stockCode: string;
  stockName: string;
  orderType: 'take_profit' | 'stop_loss';
  triggerPrice: number;
  currentPrice: number;
  status: 'active' | 'triggered' | 'cancelled';
}

export interface OrderCheckResult {
  order: ConditionalOrder;
  triggered: boolean;
  message: string;
}

class AutoStopService {
  private orders: Map<string, ConditionalOrder> = new Map();

  addOrder(order: Omit<ConditionalOrder, 'id' | 'status'>): ConditionalOrder {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newOrder: ConditionalOrder = { ...order, id, status: 'active' };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  cancelOrder(id: string): boolean {
    const order = this.orders.get(id);
    if (order) {
      order.status = 'cancelled';
      return true;
    }
    return false;
  }

  getActiveOrders(): ConditionalOrder[] {
    return Array.from(this.orders.values()).filter(o => o.status === 'active');
  }

  checkOrders(prices: Map<string, number>): OrderCheckResult[] {
    const results: OrderCheckResult[] = [];

    for (const order of this.orders.values()) {
      if (order.status !== 'active') continue;

      const currentPrice = prices.get(order.stockCode);
      if (!currentPrice) continue;

      let triggered = false;
      let message = '';

      if (order.orderType === 'take_profit' && currentPrice >= order.triggerPrice) {
        triggered = true;
        message = `${order.stockName} 触发止盈，现价 ${currentPrice}`;
      } else if (order.orderType === 'stop_loss' && currentPrice <= order.triggerPrice) {
        triggered = true;
        message = `${order.stockName} 触发止损，现价 ${currentPrice}`;
      }

      if (triggered) {
        order.status = 'triggered';
      }

      results.push({ order, triggered, message });
    }

    return results.filter(r => r.triggered);
  }
}

export const autoStopService = new AutoStopService();
