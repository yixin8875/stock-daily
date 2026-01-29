import { logger } from './logger.service';

interface NotificationPayload {
  title: string;
  content: string;
  url?: string;
}

interface WechatConfig {
  corpId: string;
  agentId: string;
  secret: string;
}

interface DingTalkConfig {
  webhook: string;
  secret?: string;
}

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

class NotificationService {
  private wechatToken: string | null = null;
  private wechatTokenExpiry: number = 0;

  // 企业微信推送
  async sendWechat(config: WechatConfig, userId: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const token = await this.getWechatToken(config);
      if (!token) return false;

      const response = await fetch(
        `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            touser: userId,
            msgtype: 'textcard',
            agentid: config.agentId,
            textcard: {
              title: payload.title,
              description: payload.content,
              url: payload.url || 'https://work.weixin.qq.com',
            },
          }),
        }
      );

      const data: any = await response.json();
      if (data.errcode !== 0) {
        logger.error('Wechat send failed:', data);
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Wechat notification error:', error);
      return false;
    }
  }

  private async getWechatToken(config: WechatConfig): Promise<string | null> {
    if (this.wechatToken && Date.now() < this.wechatTokenExpiry) {
      return this.wechatToken;
    }

    try {
      const response = await fetch(
        `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${config.corpId}&corpsecret=${config.secret}`
      );
      const data: any = await response.json();

      if (data.access_token) {
        this.wechatToken = data.access_token;
        this.wechatTokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
        return this.wechatToken;
      }
      return null;
    } catch (error) {
      logger.error('Get wechat token error:', error);
      return null;
    }
  }

  // 钉钉推送
  async sendDingTalk(config: DingTalkConfig, payload: NotificationPayload): Promise<boolean> {
    try {
      let url = config.webhook;

      if (config.secret) {
        const timestamp = Date.now();
        const sign = await this.getDingTalkSign(config.secret, timestamp);
        url += `&timestamp=${timestamp}&sign=${sign}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            title: payload.title,
            text: `### ${payload.title}\n\n${payload.content}`,
          },
        }),
      });

      const data: any = await response.json();
      if (data.errcode !== 0) {
        logger.error('DingTalk send failed:', data);
        return false;
      }
      return true;
    } catch (error) {
      logger.error('DingTalk notification error:', error);
      return false;
    }
  }

  private async getDingTalkSign(secret: string, timestamp: number): Promise<string> {
    const crypto = await import('crypto');
    const stringToSign = `${timestamp}\n${secret}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    return encodeURIComponent(hmac.digest('base64'));
  }

  // Telegram 推送
  async sendTelegram(config: TelegramConfig, payload: NotificationPayload): Promise<boolean> {
    try {
      const text = `*${payload.title}*\n\n${payload.content}`;
      const response = await fetch(
        `https://api.telegram.org/bot${config.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.chatId,
            text,
            parse_mode: 'Markdown',
          }),
        }
      );

      const data: any = await response.json();
      if (!data.ok) {
        logger.error('Telegram send failed:', data);
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Telegram notification error:', error);
      return false;
    }
  }

  // Server酱推送
  async sendServerChan(sendKey: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await fetch(`https://sctapi.ftqq.com/${sendKey}.send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          desp: payload.content,
        }),
      });

      const data: any = await response.json();
      if (data.code !== 0) {
        logger.error('ServerChan send failed:', data);
        return false;
      }
      return true;
    } catch (error) {
      logger.error('ServerChan notification error:', error);
      return false;
    }
  }

  // Bark 推送 (iOS)
  async sendBark(deviceKey: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await fetch(`https://api.day.app/${deviceKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          body: payload.content,
          url: payload.url,
        }),
      });

      const data: any = await response.json();
      if (data.code !== 200) {
        logger.error('Bark send failed:', data);
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Bark notification error:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
