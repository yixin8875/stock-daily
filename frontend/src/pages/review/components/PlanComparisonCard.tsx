import React from 'react'
import { Card, Table, Tag, Space, Typography, Empty, Tabs, Badge } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import type { PlanExecutionPair } from '@/types/review'
import { useThemeStore } from '@/stores'

const { Text } = Typography

interface PlanComparisonCardProps {
  pairs: PlanExecutionPair[]
}

const STATUS_CONFIG = {
  executed: { label: '已执行', color: 'success', icon: <CheckCircleOutlined /> },
  partial: { label: '部分执行', color: 'warning', icon: <MinusCircleOutlined /> },
  missed: { label: '未执行', color: 'error', icon: <CloseCircleOutlined /> },
  pending: { label: '待执行', color: 'default', icon: <QuestionCircleOutlined /> },
}

const PlanComparisonCard: React.FC<PlanComparisonCardProps> = ({ pairs }) => {
  const { mode } = useThemeStore()

  const buyPairs = pairs.filter(p => p.planType === 'buy')
  const sellPairs = pairs.filter(p => p.planType === 'sell')

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (record: PlanExecutionPair) => (
        <div>
          <Text strong>{record.stockName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.stockCode}
          </Text>
        </div>
      ),
    },
    {
      title: '计划价格',
      key: 'planPrice',
      render: (record: PlanExecutionPair) => (
        <Text>{record.plannedPrice.toFixed(2)} 元</Text>
      ),
    },
    {
      title: '实际价格',
      key: 'actualPrice',
      render: (record: PlanExecutionPair) => (
        <Text>{record.actualPrice ? `${record.actualPrice.toFixed(2)} 元` : '-'}</Text>
      ),
    },
    {
      title: '价格偏差',
      key: 'deviation',
      render: (record: PlanExecutionPair) => {
        if (record.deviation === null) return <Text type="secondary">-</Text>
        return (
          <Tag color={Math.abs(record.deviation) <= 2 ? 'green' : Math.abs(record.deviation) <= 5 ? 'orange' : 'red'}>
            {record.deviation >= 0 ? '+' : ''}{record.deviation.toFixed(2)}%
          </Tag>
        )
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (record: PlanExecutionPair) => {
        const config = STATUS_CONFIG[record.status]
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        )
      },
    },
  ]

  const getStatusCounts = (items: PlanExecutionPair[]) => ({
    executed: items.filter(p => p.status === 'executed').length,
    partial: items.filter(p => p.status === 'partial').length,
    missed: items.filter(p => p.status === 'missed').length,
    pending: items.filter(p => p.status === 'pending').length,
  })

  const renderSection = (items: PlanExecutionPair[], type: 'buy' | 'sell') => {
    const counts = getStatusCounts(items)

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Badge count={counts.executed} color="#10B981" />
            <Text>已执行</Text>
            <Badge count={counts.partial} color="#F59E0B" />
            <Text>部分执行</Text>
            <Badge count={counts.missed} color="#EF4444" />
            <Text>未执行</Text>
          </Space>
        </div>

        {items.length > 0 ? (
          <Table
            columns={columns}
            dataSource={items}
            rowKey={(record) => `${record.stockCode}-${record.planType}`}
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description={`暂无${type === 'buy' ? '买入' : '卖出'}计划`} />
        )}
      </div>
    )
  }

  const tabItems = [
    {
      key: 'buy',
      label: (
        <span>
          买入计划
          <Badge
            count={buyPairs.length}
            style={{ marginLeft: 8 }}
            color="#3B82F6"
          />
        </span>
      ),
      children: renderSection(buyPairs, 'buy'),
    },
    {
      key: 'sell',
      label: (
        <span>
          卖出计划
          <Badge
            count={sellPairs.length}
            style={{ marginLeft: 8 }}
            color="#EF4444"
          />
        </span>
      ),
      children: renderSection(sellPairs, 'sell'),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SwapOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>计划执行对比</span>
        </Space>
      }
    >
      <Tabs items={tabItems} />
    </Card>
  )
}

export default PlanComparisonCard
