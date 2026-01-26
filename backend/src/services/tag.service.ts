import { prisma } from '../app';
import { ApiError } from '../middlewares';
import { TagCategory } from '@prisma/client';

export interface CreateTagInput {
  name: string;
  color?: string;
  category: TagCategory;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
}

export interface TagFilter {
  category?: TagCategory;
}

// System preset tags
const PRESET_TAGS: { name: string; category: TagCategory; color: string }[] = [
  // Strategy tags (STRATEGY)
  { name: '趋势跟踪', category: 'STRATEGY', color: '#1890FF' },
  { name: '均值回归', category: 'STRATEGY', color: '#1890FF' },
  { name: '突破', category: 'STRATEGY', color: '#1890FF' },
  { name: '抄底', category: 'STRATEGY', color: '#1890FF' },
  { name: '追涨', category: 'STRATEGY', color: '#1890FF' },
  { name: '波段', category: 'STRATEGY', color: '#1890FF' },
  { name: '短线', category: 'STRATEGY', color: '#1890FF' },
  { name: '中线', category: 'STRATEGY', color: '#1890FF' },

  // Sector tags (SECTOR)
  { name: '科技', category: 'SECTOR', color: '#52C41A' },
  { name: '消费', category: 'SECTOR', color: '#52C41A' },
  { name: '医药', category: 'SECTOR', color: '#52C41A' },
  { name: '金融', category: 'SECTOR', color: '#52C41A' },
  { name: '周期', category: 'SECTOR', color: '#52C41A' },
  { name: '新能源', category: 'SECTOR', color: '#52C41A' },
  { name: '半导体', category: 'SECTOR', color: '#52C41A' },
  { name: '军工', category: 'SECTOR', color: '#52C41A' },

  // Reflection tags (REFLECTION)
  { name: '追涨杀跌', category: 'REFLECTION', color: '#FF4D4F' },
  { name: '止损不及时', category: 'REFLECTION', color: '#FF4D4F' },
  { name: '止盈过早', category: 'REFLECTION', color: '#FF4D4F' },
  { name: '仓位过重', category: 'REFLECTION', color: '#FF4D4F' },
  { name: '频繁交易', category: 'REFLECTION', color: '#FF4D4F' },
  { name: '情绪化操作', category: 'REFLECTION', color: '#FF4D4F' },
];

export class TagService {
  /**
   * Create a new tag
   */
  static async create(userId: string, input: CreateTagInput) {
    // Check if tag with same name already exists for this user
    const existingTag = await prisma.tag.findUnique({
      where: {
        userId_name: {
          userId,
          name: input.name,
        },
      },
    });

    if (existingTag) {
      throw new ApiError(400, 'Tag with this name already exists');
    }

    const tag = await prisma.tag.create({
      data: {
        userId,
        name: input.name,
        color: input.color || '#1890FF',
        category: input.category,
      },
    });

    return tag;
  }

  /**
   * Get all tags for a user with optional category filter
   */
  static async findAll(userId: string, filter: TagFilter = {}) {
    const whereClause: any = { userId };

    if (filter.category) {
      whereClause.category = filter.category;
    }

    const tags = await prisma.tag.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return tags;
  }

  /**
   * Get a single tag by ID
   */
  static async findById(userId: string, id: string) {
    const tag = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new ApiError(404, 'Tag not found');
    }

    return tag;
  }

  /**
   * Update a tag
   */
  static async update(userId: string, id: string, input: UpdateTagInput) {
    // Verify tag exists and belongs to user
    const tag = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new ApiError(404, 'Tag not found');
    }

    // If name is being updated, check for duplicates
    if (input.name && input.name !== tag.name) {
      const existingTag = await prisma.tag.findUnique({
        where: {
          userId_name: {
            userId,
            name: input.name,
          },
        },
      });

      if (existingTag) {
        throw new ApiError(400, 'Tag with this name already exists');
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: input,
    });

    return updatedTag;
  }

  /**
   * Delete a tag
   */
  static async delete(userId: string, id: string) {
    // Verify tag exists and belongs to user
    const tag = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new ApiError(404, 'Tag not found');
    }

    await prisma.tag.delete({
      where: { id },
    });

    return { message: 'Tag deleted successfully' };
  }

  /**
   * Initialize preset tags for a user
   */
  static async initPresetTags(userId: string) {
    // Check if user already has tags
    const existingTags = await prisma.tag.count({
      where: { userId },
    });

    if (existingTags > 0) {
      throw new ApiError(400, 'User already has tags initialized');
    }

    // Create all preset tags
    const createdTags = await prisma.tag.createMany({
      data: PRESET_TAGS.map((tag) => ({
        userId,
        name: tag.name,
        color: tag.color,
        category: tag.category,
      })),
    });

    // Return the created tags
    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: [
        { category: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return {
      message: `Successfully initialized ${createdTags.count} preset tags`,
      data: tags,
    };
  }

  /**
   * Increment usage count for a tag
   */
  static async incrementUsageCount(userId: string, id: string) {
    const tag = await prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new ApiError(404, 'Tag not found');
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
    });

    return updatedTag;
  }
}
