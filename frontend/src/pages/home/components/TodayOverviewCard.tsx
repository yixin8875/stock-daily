import React from 'react'
import { Card, Statistic, Tag, Typography, Space } from 'antd'
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import type { TodayOverview } from '@/types/dashboard'

const { Text } = Typography

interface TodayOverviewCardProps {
  data: TodayOverview | null
  loading?: boolean
}

const TodayOverviewCard: React.FC<TodayOverviewCardProps> = ({ data, loading }) => {
  const getProfitColor = (value: number | null) => {
    if (value === null) return undefined
    return value >= 0 ? '#F5222D' : '#52C41A'
  }

  const formatProfit = (value: number | null) => {
    if (value === null) return '--'
    const prefix = value >= 0 ? '+' : ''
    return `${prefix}${value.toFixed(2)}`
  }

  const formatProfitRate = (value: number | null) => {
    if (value === null) return '--'
    const prefix = value >= 0 ? '+' : ''
    return `${prefix}${value.toFixed(2)}%`
  }

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined />
          <span>今日概览</span>
        </Space>
      }
      loading={loading}
      extra={
        data && (
          <Text type="secondary">
            {data.date} {data.weekday}
          </Text>
        )
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        <Statistic
          title="今日盈亏"
          value={formatProfit(data?.todayProfit ?? null)}
          valueStyle={{ color: getProfitColor(data?.todayProfit ?? null) }}
          suffix="元"
        />
        <Statistic
          title="盈亏比例"
          value={formatProfitRate(data?.todayProfitRate ?? null)}
          valueStyle={{ color: getProfitColor(data?.todayProfitRate ?? null) }}
        />
        <Statistic
          title="交易笔数"
          value={data?.tradeCount ?? 0}
          suffix="笔"
        />
        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '8px' }}>
          <Text type="secondary" style={{ marginRight: '8px' }}>日记状态:</Text>
          {data?.hasDiaryRecord ? (
            <Tag icon={<CheckCircleOutlined />} color="success">已记录</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="warning">未记录</Tag>
          )}
        </div>
      </div>
    </Card>
  )
}

export default TodayOverviewCard
