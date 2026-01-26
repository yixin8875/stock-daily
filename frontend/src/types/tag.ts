// 标签分类枚举
export type TagCategory = 'strategy' | 'sector' | 'reflection' | 'custom'

// 标签分类选项
export const TAG_CATEGORIES = [
  { label: '策略标签', value: 'strategy' },
  { label: '板块标签', value: 'sector' },
  { label: '反思标签', value: 'reflection' },
  { label: '自定义标签', value: 'custom' },
] as const

// 标签分类中文映射
export const TAG_CATEGORY_LABELS: Record<TagCategory, string> = {
  strategy: '策略标签',
  sector: '板块标签',
  reflection: '反思标签',
  custom: '自定义标签',
}

// 预设颜色
export const PRESET_COLORS = [
  '#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14',
  '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb',
  '#722ed1', '#eb2f96', '#8c8c8c', '#595959', '#262626',
] as const

// 标签接口
export interface Tag {
  id: number
  name: string
  color: string
  category: TagCategory
  usageCount: number
  userId: number
  createdAt: string
  updatedAt: string
}

// 创建标签参数
export interface CreateTagParams {
  name: string
  color: string
  category: TagCategory
}

// 更新标签参数
export interface UpdateTagParams {
  name?: string
  color?: string
}

// 标签列表响应（按分类分组）
export interface TagsByCategory {
  strategy: Tag[]
  sector: Tag[]
  reflection: Tag[]
  custom: Tag[]
}
