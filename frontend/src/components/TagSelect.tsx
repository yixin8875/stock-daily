import React, { useEffect, useState, useMemo } from 'react'
import { Select, Tabs, Input, Empty, Spin, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useTagStore } from '@/stores/tagStore'
import type { TagCategory } from '@/types/tag'
import { TAG_CATEGORY_LABELS } from '@/types/tag'

interface TagSelectProps {
  value?: number | number[]
  onChange?: (value: number | number[]) => void
  mode?: 'single' | 'multiple'
  category?: TagCategory | TagCategory[]
  placeholder?: string
  style?: React.CSSProperties
  showSearch?: boolean
  allowClear?: boolean
  disabled?: boolean
}

const TagSelect: React.FC<TagSelectProps> = ({
  value,
  onChange,
  mode = 'multiple',
  category,
  placeholder = '请选择标签',
  style,
  showSearch = true,
  allowClear = true,
  disabled = false,
}) => {
  const { tags, loading, fetchTags, initialized } = useTagStore()
  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    if (!initialized) {
      fetchTags()
    }
  }, [initialized, fetchTags])

  // 根据分类过滤标签
  const filteredTags = useMemo(() => {
    let result = tags

    // 按指定分类过滤
    if (category) {
      const categories = Array.isArray(category) ? category : [category]
      result = result.filter(t => categories.includes(t.category))
    }

    // 按当前选中的分类Tab过滤
    if (activeCategory !== 'all') {
      result = result.filter(t => t.category === activeCategory)
    }

    // 按搜索文本过滤
    if (searchText) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    return result
  }, [tags, category, activeCategory, searchText])

  // 获取可用的分类
  const availableCategories = useMemo(() => {
    if (category) {
      const categories = Array.isArray(category) ? category : [category]
      return categories
    }
    return ['strategy', 'sector', 'reflection', 'custom'] as TagCategory[]
  }, [category])

  // 处理选择变化
  const handleChange = (selectedValue: number | number[]) => {
    onChange?.(selectedValue)
  }

  // 自定义下拉内容
  const dropdownRender = (menu: React.ReactNode) => (
    <div>
      {showSearch && (
        <div style={{ padding: '8px 12px' }}>
          <Input
            placeholder="搜索标签"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </div>
      )}
      {availableCategories.length > 1 && (
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          size="small"
          style={{ padding: '0 12px' }}
          items={[
            { key: 'all', label: '全部' },
            ...availableCategories.map(cat => ({
              key: cat,
              label: TAG_CATEGORY_LABELS[cat],
            })),
          ]}
        />
      )}
      {menu}
    </div>
  )

  // 自定义标签渲染
  const tagRender = (props: { label: React.ReactNode; value: number; closable: boolean; onClose: () => void }) => {
    const tag = tags.find(t => t.id === props.value)
    if (!tag) return <Tag>{props.label}</Tag>
    return (
      <Tag
        color={tag.color}
        closable={props.closable}
        onClose={props.onClose}
        style={{ marginRight: 3 }}
      >
        {tag.name}
      </Tag>
    )
  }

  if (loading && !initialized) {
    return <Spin size="small" />
  }

  return (
    <Select
      mode={mode === 'multiple' ? 'multiple' : undefined}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      allowClear={allowClear}
      disabled={disabled}
      dropdownRender={dropdownRender}
      tagRender={mode === 'multiple' ? tagRender : undefined}
      optionLabelProp="label"
      notFoundContent={<Empty description="暂无标签" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      options={filteredTags.map(tag => ({
        label: tag.name,
        value: tag.id,
      }))}
      optionRender={(option) => {
        const tag = tags.find(t => t.id === option.value)
        if (!tag) return option.label
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color={tag.color} style={{ margin: 0 }}>{tag.name}</Tag>
            <span style={{ color: '#999', fontSize: 12 }}>
              ({TAG_CATEGORY_LABELS[tag.category]})
            </span>
          </div>
        )
      }}
    />
  )
}

export default TagSelect
