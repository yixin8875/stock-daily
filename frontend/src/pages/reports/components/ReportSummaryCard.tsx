import React from 'react'
import { Card, Row, Col, Statistic, Progress, Space, Typography, theme } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons'
import type { ProfitSummary } from '@/types/report'
import { useThemeStore } from '@/stores'

const { Text } = Typography

interface ReportSummaryCardProps {
  profitSummary: ProfitSummary
  periodLabel: string
}

const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  profitSummary,
  periodLabel,
}) => {
  const { mode } = useThemeStore()
  const { token } = theme.useToken()

  const isProfit = profitSummary.netProfit >= 0

  const StatBox = ({
    title,
    value,
    suffix,
    prefix,
    valueStyle,
    icon,
  }: {
    title: string
    value: number | string
    suffix?: string
    prefix?: React.ReactNode
    valueStyle?: React.CSSProperties
    icon?: React.ReactNode
  }) => (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon}
        <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
      </div>
      <Statistic
        value={value}
        suffix={suffix}
        prefix={prefix}
        valueStyle={{ fontSize: 24, fontWeight: 700, ...valueStyle }}
      />
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
              background: `linear-gradient(135deg, ${token.colorPrimary} 0%, #6366F1 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrophyOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>{periodLabel} 收益概览</span>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <StatBox
            title="净收益"
            value={profitSummary.netProfit.toFixed(2)}
            suffix="元"
            prefix={isProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{ color: isProfit ? '#10B981' : '#EF4444' }}
            icon={isProfit ? <RiseOutlined style={{ color: '#10B981' }} /> : <FallOutlined style={{ color: '#EF4444' }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatBox
            title="收益率"
            value={profitSummary.profitRate.toFixed(2)}
            suffix="%"
            prefix={isProfit ? '+' : ''}
            valueStyle={{ color: isProfit ? '#10B981' : '#EF4444' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatBox
            title="交易天数"
            value={profitSummary.tradingDays}
            suffix="天"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatBox
            title="胜率"
            value={profitSummary.winRate.toFixed(1)}
            suffix="%"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>胜率分布</Text>
            <div style={{ marginTop: 12 }}>
              <Progress
                percent={profitSummary.winRate}
                strokeColor={{
                  '0%': '#10B981',
                  '100%': '#059669',
                }}
                format={(percent) => `${percent?.toFixed(1)}%`}
              />
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12}>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>盈亏分布</Text>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#10B981', fontWeight: 600 }}>+{profitSummary.totalProfit.toFixed(2)}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>总盈利</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#EF4444', fontWeight: 600 }}>-{profitSummary.totalLoss.toFixed(2)}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>总亏损</Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default ReportSummaryCard
