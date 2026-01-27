import React from 'react'
import { Card, Table, Tag, Space, Typography, theme } from 'antd'
import { RiseOutlined, FallOutlined, StockOutlined } from '@ant-design/icons'
import type { StockPerformance } from '@/types/report'

const { Text } = Typography

interface StockRankingTableProps {
  stockPerformance: StockPerformance[]
}

const StockRankingTable: React.FC<StockRankingTableProps> = ({
  stockPerformance,
}) => {
  const { token } = theme.useToken()

  const topProfitable = stockPerformance.filter(s => s.profit > 0).slice(0, 5)
  const topLosing = stockPerformance.filter(s => s.profit < 0).slice(0, 5)

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => (
        <Tag
          color={index < 3 ? 'gold' : 'default'}
          style={{ borderRadius: 4, fontWeight: 600 }}
        >
          {index + 1}
        </Tag>
      ),
    },
    {
      title: '股票',
      key: 'stock',
      render: (record: StockPerformance) => (
        <div>
          <Text strong>{record.stockName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </div>
      ),
    },
    {
      title: '收益',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => (
        <Text style={{ color: profit >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
          {profit >= 0 ? '+' : ''}{profit.toFixed(2)} 元
        </Text>
      ),
    },
    {
      title: '收益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      render: (rate: number) => (
        <Text style={{ color: rate >= 0 ? '#10B981' : '#EF4444' }}>
          {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
        </Text>
      ),
    },
    {
      title: '交易次数',
      dataIndex: 'tradeCount',
      key: 'tradeCount',
      render: (count: number) => `${count} 笔`,
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
            <StockOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>股票表现排名</span>
        </Space>
      }
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <RiseOutlined style={{ color: '#10B981', fontSize: 18 }} />
          <Text strong style={{ color: '#10B981' }}>盈利榜 TOP 5</Text>
        </div>
        <Table
          columns={columns}
          dataSource={topProfitable}
          rowKey="stockCode"
          pagination={false}
          size="small"
        />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FallOutlined style={{ color: '#EF4444', fontSize: 18 }} />
          <Text strong style={{ color: '#EF4444' }}>亏损榜 TOP 5</Text>
        </div>
        <Table
          columns={columns}
          dataSource={topLosing}
          rowKey="stockCode"
          pagination={false}
          size="small"
        />
      </div>
    </Card>
  )
}

export default StockRankingTable
