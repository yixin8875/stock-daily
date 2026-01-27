import React from 'react'
import { Card, List, Tag, Space, Typography } from 'antd'
import { BulbOutlined, WarningOutlined, CheckCircleOutlined, BookOutlined } from '@ant-design/icons'
import type { LearningItem, ReflectionItem } from '@/types/report'
import { useThemeStore } from '@/stores'

const { Text } = Typography

interface LearningHighlightsProps {
  learnings: LearningItem[]
  reflections: ReflectionItem[]
}

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: '技术分析',
  FUNDAMENTAL: '基本面',
  PSYCHOLOGY: '交易心理',
  MARKET: '市场规律',
  OTHER: '其他',
}

const LearningHighlights: React.FC<LearningHighlightsProps> = ({
  learnings,
  reflections,
}) => {
  const { mode } = useThemeStore()

  const goodReflections = reflections.filter(r => r.type === 'good')
  const badReflections = reflections.filter(r => r.type === 'bad')
  const improveReflections = reflections.filter(r => r.type === 'improve')

  const SectionCard = ({
    title,
    icon,
    items,
    color,
    emptyText,
  }: {
    title: string
    icon: React.ReactNode
    items: { content: string; date?: string }[]
    color: string
    emptyText: string
  }) => (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color }}>{icon}</span>
        <Text strong>{title}</Text>
      </div>
      {items.length > 0 ? (
        <List
          size="small"
          dataSource={items}
          renderItem={(item) => (
            <List.Item style={{ padding: '8px 0', border: 'none' }}>
              <div>
                <Text>{item.content}</Text>
                {item.date && (
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                    ({item.date})
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary">{emptyText}</Text>
      )}
    </div>
  )

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BulbOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>学习与反思</span>
        </Space>
      }
    >
      <SectionCard
        title="学习要点"
        icon={<BookOutlined style={{ fontSize: 16 }} />}
        items={learnings.map(l => ({ content: `[${CATEGORY_LABELS[l.category] || l.category}] ${l.content}`, date: l.date }))}
        color="#3B82F6"
        emptyText="本期暂无学习记录"
      />

      <SectionCard
        title="做得好的"
        icon={<CheckCircleOutlined style={{ fontSize: 16 }} />}
        items={goodReflections.map(r => ({ content: r.content, date: r.date }))}
        color="#10B981"
        emptyText="本期暂无记录"
      />

      <SectionCard
        title="需要改进"
        icon={<WarningOutlined style={{ fontSize: 16 }} />}
        items={badReflections.map(r => ({ content: r.content, date: r.date }))}
        color="#EF4444"
        emptyText="本期暂无记录"
      />

      {improveReflections.length > 0 && (
        <SectionCard
          title="改进计划"
          icon={<BulbOutlined style={{ fontSize: 16 }} />}
          items={improveReflections.map(r => ({ content: r.content, date: r.date }))}
          color="#F59E0B"
          emptyText="本期暂无改进计划"
        />
      )}
    </Card>
  )
}

export default LearningHighlights
