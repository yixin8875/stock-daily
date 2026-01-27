import React from 'react'
import { Card, Tag, Typography, Space, Row, Col, theme } from 'antd'
import { CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, SwapOutlined } from '@ant-design/icons'
import type { TodayOverview } from '@/types/dashboard'
import { useThemeStore } from '@/stores'

const { Text } = Typography

interface TodayOverviewCardProps {
  data: TodayOverview | null
  loading?: boolean
}

const TodayOverviewCard: React.FC<TodayOverviewCardProps> = ({ data, loading }) => {
  const { mode } = useThemeStore()
  const { token: { colorPrimary } } = theme.useToken()

  const isProfit = (value: number | null) => value !== null && value >= 0

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

  // 统计卡片样式
  const StatCard = ({
    title,
    value,
    suffix,
    icon,
    type = 'default'
  }: {
    title: string
    value: string | number
    suffix?: string
    icon: React.ReactNode
    type?: 'profit' | 'loss' | 'default'
  }) => {
    const bgColors = {
      profit: mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
      loss: mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
      default: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.08)',
    }
    const iconColors = {
      profit: '#10B981',
      loss: '#EF4444',
      default: colorPrimary,
    }
    const valueColors = {
      profit: '#10B981',
      loss: '#EF4444',
      default: undefined,
    }

    return (
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          background: bgColors[type],
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColors[type],
            }}
          >
            {icon}
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: valueColors[type],
              fontFeatureSettings: '"tnum"',
            }}
          >
            {value}
          </span>
          {suffix && <Text type="secondary" style={{ fontSize: 14 }}>{suffix}</Text>}
        </div>
      </div>
    )
  }

  const profitValue = data?.todayProfit ?? null
  const profitType = profitValue === null ? 'default' : (isProfit(profitValue) ? 'profit' : 'loss')

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${colorPrimary} 0%, #6366F1 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>今日概览</span>
        </Space>
      }
      loading={loading}
      extra={
        data && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {data.date} {data.weekday}
            </Text>
            {data?.hasDiaryRecord ? (
              <Tag
                icon={<CheckCircleOutlined />}
                color="success"
                style={{ margin: 0, borderRadius: 6 }}
              >
                已记录
              </Tag>
            ) : (
              <Tag
                icon={<CloseCircleOutlined />}
                color="warning"
                style={{ margin: 0, borderRadius: 6 }}
              >
                未记录
              </Tag>
            )}
          </div>
        )
      }
      styles={{
        body: { padding: 20 },
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="今日盈亏"
            value={formatProfit(profitValue)}
            suffix="元"
            icon={isProfit(profitValue) ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            type={profitType}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="盈亏比例"
            value={formatProfitRate(data?.todayProfitRate ?? null)}
            icon={isProfit(data?.todayProfitRate ?? null) ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            type={data?.todayProfitRate === null ? 'default' : (isProfit(data?.todayProfitRate ?? null) ? 'profit' : 'loss')}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            title="交易笔数"
            value={data?.tradeCount ?? 0}
            suffix="笔"
            icon={<SwapOutlined />}
            type="default"
          />
        </Col>
      </Row>
    </Card>
  )
}

export default TodayOverviewCard
