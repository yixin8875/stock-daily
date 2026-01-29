import nodemailer from 'nodemailer';
import { logger } from './logger.service';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  init(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      logger.warn('Email service not configured');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    logger.info('Email service initialized');
  }

  async send(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email not sent: service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        ...options,
      });
      logger.info(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPriceAlert(to: string, stock: { code: string; name: string; price: number; target: number }): Promise<boolean> {
    const direction = stock.price >= stock.target ? '突破' : '跌破';
    return this.send({
      to,
      subject: `【价格提醒】${stock.name}(${stock.code}) ${direction} ${stock.target}`,
      html: `
        <h2>股票价格提醒</h2>
        <p><strong>${stock.name}</strong> (${stock.code})</p>
        <p>当前价格: <strong>${stock.price}</strong></p>
        <p>目标价格: ${stock.target}</p>
        <p>触发时间: ${new Date().toLocaleString('zh-CN')}</p>
      `,
    });
  }
}

export const emailService = new EmailService();