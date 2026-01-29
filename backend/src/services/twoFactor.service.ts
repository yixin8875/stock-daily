import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger.service';

const prisma = new PrismaClient();

class TwoFactorService {
  private readonly issuer = 'StockDaily';
  private readonly digits = 6;
  private readonly period = 30;

  // 生成随机密钥
  generateSecret(): string {
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  // Base32 编码
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of buffer) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        result += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      result += alphabet[(value << (5 - bits)) & 31];
    }

    return result;
  }

  // Base32 解码
  private base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;

    for (const char of encoded.toUpperCase()) {
      const idx = alphabet.indexOf(char);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(bytes);
  }

  // 生成 TOTP
  private generateTOTP(secret: string, time?: number): string {
    const epoch = time ?? Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / this.period);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const key = this.base32Decode(secret);
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(counterBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0x0f;
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % Math.pow(10, this.digits);

    return code.toString().padStart(this.digits, '0');
  }

  // 生成 OTP URI
  generateOtpAuthUrl(email: string, secret: string): string {
    const params = new URLSearchParams({
      secret,
      issuer: this.issuer,
      algorithm: 'SHA1',
      digits: this.digits.toString(),
      period: this.period.toString(),
    });
    return `otpauth://totp/${this.issuer}:${email}?${params}`;
  }

  // 生成二维码
  async generateQRCode(otpAuthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpAuthUrl);
  }

  // 验证 TOTP
  verifyToken(token: string, secret: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    // 允许前后一个时间窗口的误差
    for (let i = -1; i <= 1; i++) {
      const expected = this.generateTOTP(secret, now + i * this.period);
      if (token === expected) return true;
    }
    return false;
  }

  // 为用户启用 2FA
  async enableTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const secret = this.generateSecret();
    const otpAuthUrl = this.generateOtpAuthUrl(user.email, secret);
    const qrCode = await this.generateQRCode(otpAuthUrl);

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    logger.info(`2FA setup initiated for user ${userId}`);
    return { secret, qrCode };
  }

  // 确认启用 2FA
  async confirmTwoFactor(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) throw new Error('2FA not setup');

    if (!this.verifyToken(token, user.twoFactorSecret)) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    logger.info(`2FA enabled for user ${userId}`);
    return true;
  }

  // 禁用 2FA
  async disableTwoFactor(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) throw new Error('2FA not enabled');

    if (!this.verifyToken(token, user.twoFactorSecret)) {
      return false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    logger.info(`2FA disabled for user ${userId}`);
    return true;
  }

  // 验证登录时的 2FA
  async verifyLogin(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) return true;
    return this.verifyToken(token, user.twoFactorSecret);
  }

  // 检查是否启用了 2FA
  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });
    return user?.twoFactorEnabled ?? false;
  }
}

export const twoFactorService = new TwoFactorService();
