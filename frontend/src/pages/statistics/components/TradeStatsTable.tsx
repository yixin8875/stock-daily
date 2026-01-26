import React from 'react'
import { Card, Table, Spin, Empty } from 'antd'
import type { TradeStats } from '@/types/statistics'

interface TradeStatsTableProps {
  stats: TradeStats | null
  loading: boolean
}

const PROFIT_COLOR = '#F5222D'
const LOSS_COLOR = '#52C41A'

const TradeStatsTable: React.FC<TradeStatsTableProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <Card title="交易统计">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card title="交易统计">
        <Empty description="暂无数据" />
      </Card>
    )
  }

  const dataSource = [
    { key: '1', label: '总交易次数', value: stats.totalTrades, unit: '次' },
    {
      key: '2',
      label: '盈利次数',
      value: stats.profitTrades,
      unit: '次',
      color: PROFIT_COLOR,
    },
    {
      key: '3',
      label: '亏损次数',
      value: stats.lossTrades,
      unit: '次',
      color: LOSS_COLOR,
    },
    {
      key: '4',
      label: '最大单笔盈利',
      value: stats.maxSingleProfit.toFixed(2),
      unit: '元',
      color: PROFIT_COLOR,
    },
    {
      key: '5',
      label: '最大单笔亏损',
      value: stats.maxSingleLoss.toFixed(2),
      unit: '元',
      color: LOSS_COLOR,
    },
    {
      key: '6',
      label: '最大连续盈利',
      value: stats.maxConsecutiveWins,
      unit: '次',
      color: PROFIT_COLOR,
    },
    {
      key: '7',
      label: '最大连续亏损',
      value: stats.maxConsecutiveLosses,
      unit: '次',
      color: LOSS_COLOR,
    },
    {
      key: '8',
      label: '平均持仓天数',
      value: stats.avgHoldingDays.toFixed(1),
      unit: '天',
    },
  ]

  const columns = [
    {
      title: '指标',
      dataIndex: 'label',
      key: 'label',
      width: '50%',
    },
    {
      title: '数值',
      dataIndex: 'value',
      key: 'value',
      width: '50%',
      render: (value: string | number, record: any) => (
        <span style={{ color: record.color, fontWeight: 500 }}>
          {value} {record.unit}
        </span>
      ),
    },
  ]

  return (
    <Card title="交易统计">
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        bordered
      />
    </Card>
  )
}

export default TradeStatsTable
