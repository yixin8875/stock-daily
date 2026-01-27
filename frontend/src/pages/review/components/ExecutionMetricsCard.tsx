import React from 'react'
import { Card, Row, Col, Progress, Statistic, Space, Typography, theme } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  AimOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { ExecutionMetrics } from '@/types/review'
import { useThemeStore } from '@/stores'

const { Text } = Typography

interface ExecutionMetricsCardProps {
  metrics: ExecutionMetrics
}

const ExecutionMetricsCard: React.FC<ExecutionMetricsCardProps> = ({ metrics }) => {
  const { mode } = useThemeStore()
  const { token } = theme.useToken()

  const getExecutionColor = (rate: number) => {
    if (rate >= 80) return '#10B981'
    if (rate >= 60) return '#F59E0B'
    return '#EF4444'
  }

  const MetricBox = ({
    title,
    value,
    suffix,
    icon,
    color,
  }: {
    title: string
    value: number | string
    suffix?: string
    icon: React.ReactNode
    color?: string
  }) => (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: 8, color: color || token.colorPrimary }}>{icon}</div>
      <Statistic
        value={value}
        suffix={suffix}
        valueStyle={{ fontSize: 24, fontWeight: 700, color }}
      />
      <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
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
            <AimOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>执行指标</span>
        </Space>
      }
    >
      {/* 执行率概览 */}
      <div
        style={{
          textAlign: 'center',
          padding: 24,
          marginBottom: 24,
          borderRadius: 12,
          background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700, color: getExecutionColor(metrics.executionRate) }}>
          {metrics.executionRate.toFixed(1)}%
        </div>
        <Text style={{ fontSize: 16 }}>计划执行率</Text>
        <div style={{ marginTop: 16 }}>
          <Progress
            percent={metrics.executionRate}
            strokeColor={getExecutionColor(metrics.executionRate)}
            showInfo={false}
            size="small"
          />
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <MetricBox
            title="计划数"
            value={metrics.planCount}
            suffix="笔"
            icon={<FileTextOutlined style={{ fontSize: 24 }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <MetricBox
            title="已执行"
            value={metrics.executedCount}
            suffix="笔"
            icon={<CheckCircleOutlined style={{ fontSize: 24 }} />}
            color="#10B981"
          />
        </Col>
        <Col xs={12} sm={6}>
          <MetricBox
            title="平均偏差"
            value={Math.abs(metrics.avgDeviation).toFixed(2)}
            suffix="%"
            icon={<CloseCircleOutlined style={{ fontSize: 24 }} />}
            color={Math.abs(metrics.avgDeviation) <= 2 ? '#10B981' : '#EF4444'}
          />
        </Col>
        <Col xs={12} sm={6}>
          <MetricBox
            title="未执行"
            value={metrics.missedCount}
            suffix="笔"
            icon={<AimOutlined style={{ fontSize: 24 }} />}
            color={metrics.missedCount > 0 ? '#F59E0B' : '#10B981'}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default ExecutionMetricsCard
