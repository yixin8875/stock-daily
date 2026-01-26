import bcrypt from 'bcryptjs';
import { prisma } from '../app';
import { ApiError } from '../middlewares';

export interface UpdateProfileInput {
  username?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const { username } = input;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username || user.username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, input: ChangePasswordInput) {
    const { currentPassword, newPassword } = input;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, '当前密码不正确');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { message: '密码修改成功' };
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get diary count
    const diaryCount = await prisma.diary.count({
      where: { userId },
    });

    // Get trade count through diaries
    const tradeCount = await prisma.trade.count({
      where: {
        diary: {
          userId,
        },
      },
    });

    // Get first diary date
    const firstDiary = await prisma.diary.findFirst({
      where: { userId },
      orderBy: { date: 'asc' },
      select: { date: true },
    });

    return {
      diaryCount,
      tradeCount,
      memberSince: user.createdAt,
      firstDiaryDate: firstDiary?.date || null,
    };
  }
}
