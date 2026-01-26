import { create } from 'zustand'
import { message } from 'antd'
import { tagService } from '@/services/tag'
import type { Tag, TagCategory, CreateTagParams, UpdateTagParams, TagsByCategory } from '@/types/tag'

interface TagState {
  tags: Tag[]
  tagsByCategory: TagsByCategory
  loading: boolean
  initialized: boolean

  // Actions
  fetchTags: () => Promise<void>
  createTag: (params: CreateTagParams) => Promise<boolean>
  updateTag: (id: number, params: UpdateTagParams) => Promise<boolean>
  deleteTag: (id: number) => Promise<boolean>
  initTags: () => Promise<boolean>
  getTagsByCategory: (category: TagCategory) => Tag[]
  getTagById: (id: number) => Tag | undefined
  getTagsByIds: (ids: number[]) => Tag[]
}

// 按分类分组标签
const groupTagsByCategory = (tags: Tag[]): TagsByCategory => {
  return {
    strategy: tags.filter(t => t.category === 'strategy'),
    sector: tags.filter(t => t.category === 'sector'),
    reflection: tags.filter(t => t.category === 'reflection'),
    custom: tags.filter(t => t.category === 'custom'),
  }
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  tagsByCategory: {
    strategy: [],
    sector: [],
    reflection: [],
    custom: [],
  },
  loading: false,
  initialized: false,

  fetchTags: async () => {
    set({ loading: true })
    try {
      const response = await tagService.getTags()
      if (response.data.code === 0) {
        const tags = response.data.data
        set({
          tags,
          tagsByCategory: groupTagsByCategory(tags),
          initialized: true,
        })
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    } finally {
      set({ loading: false })
    }
  },

  createTag: async (params: CreateTagParams) => {
    try {
      const response = await tagService.createTag(params)
      if (response.data.code === 0) {
        message.success('标签创建成功')
        await get().fetchTags()
        return true
      } else {
        message.error(response.data.message || '创建失败')
        return false
      }
    } catch (error) {
      message.error('创建标签失败')
      return false
    }
  },

  updateTag: async (id: number, params: UpdateTagParams) => {
    try {
      const response = await tagService.updateTag(id, params)
      if (response.data.code === 0) {
        message.success('标签更新成功')
        await get().fetchTags()
        return true
      } else {
        message.error(response.data.message || '更新失败')
        return false
      }
    } catch (error) {
      message.error('更新标签失败')
      return false
    }
  },

  deleteTag: async (id: number) => {
    try {
      const response = await tagService.deleteTag(id)
      if (response.data.code === 0) {
        message.success('标签删除成功')
        await get().fetchTags()
        return true
      } else {
        message.error(response.data.message || '删除失败')
        return false
      }
    } catch (error) {
      message.error('删除标签失败')
      return false
    }
  },

  initTags: async () => {
    try {
      const response = await tagService.initTags()
      if (response.data.code === 0) {
        message.success('预设标签初始化成功')
        await get().fetchTags()
        return true
      } else {
        message.error(response.data.message || '初始化失败')
        return false
      }
    } catch (error) {
      message.error('初始化标签失败')
      return false
    }
  },

  getTagsByCategory: (category: TagCategory) => {
    return get().tagsByCategory[category]
  },

  getTagById: (id: number) => {
    return get().tags.find(t => t.id === id)
  },

  getTagsByIds: (ids: number[]) => {
    return get().tags.filter(t => ids.includes(t.id))
  },
}))
