import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface Client {
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, Client> = new Map();

  /**
   * 初始化 WebSocket 服务器
   */
  init(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('[WebSocket] Server initialized');
  }

  /**
   * 处理新连接
   */
  private handleConnection(ws: WebSocket, req: any): void {
    const client: Client = { ws, subscriptions: new Set() };
    this.clients.set(ws, client);

    // 尝试从 URL 参数获取 token 进行认证
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    if (token) {
      this.authenticateClient(client, token);
    }

    ws.on('message', (data) => this.handleMessage(client, data));
    ws.on('close', () => this.handleClose(ws));
    ws.on('error', (err) => console.error('[WebSocket] Error:', err));

    this.send(ws, { type: 'connected', message: 'WebSocket connected' });
  }

  /**
   * 认证客户端
   */
  private authenticateClient(client: Client, token: string): void {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) return;
      const decoded = jwt.verify(token, secret) as { userId: string };
      client.userId = decoded.userId;
    } catch {
      // 认证失败，保持匿名连接
    }
  }

  /**
   * 处理消息
   */
  private handleMessage(client: Client, data: WebSocket.RawData): void {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'subscribe':
          this.handleSubscribe(client, msg.channel);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(client, msg.channel);
          break;
        case 'ping':
          this.send(client.ws, { type: 'pong' });
          break;
      }
    } catch {
      // 忽略无效消息
    }
  }

  /**
   * 处理订阅
   */
  private handleSubscribe(client: Client, channel: string): void {
    if (!channel) return;
    client.subscriptions.add(channel);
    this.send(client.ws, { type: 'subscribed', channel });
  }

  /**
   * 处理取消订阅
   */
  private handleUnsubscribe(client: Client, channel: string): void {
    client.subscriptions.delete(channel);
    this.send(client.ws, { type: 'unsubscribed', channel });
  }

  /**
   * 处理连接关闭
   */
  private handleClose(ws: WebSocket): void {
    this.clients.delete(ws);
  }

  /**
   * 发送消息给单个客户端
   */
  private send(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * 广播消息到指定频道
   */
  broadcast(channel: string, data: any): void {
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel)) {
        this.send(client.ws, { type: 'message', channel, data });
      }
    });
  }

  /**
   * 发送消息给指定用户
   */
  sendToUser(userId: string, data: any): void {
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        this.send(client.ws, { type: 'notification', data });
      }
    });
  }

  /**
   * 获取在线客户端数量
   */
  getClientCount(): number {
    return this.clients.size;
  }
}

export const wsService = new WebSocketService();
