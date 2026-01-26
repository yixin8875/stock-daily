import React from 'react'
import { Table, Tag, DatePicker, Space, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { TodaySummary, MarketTrend } from '@/types/diary'

const { RangePicker } = DatePicker
const { Text } = Typography

interface ListViewProps {
  data: TodaySummary[]
  loading: boolean
  pagination: TablePaginationConfig
  onPaginationChange: (page: number, pageSize: number) => void
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void
  onRowClick: (record: TodaySummary) => void
  dateRange: [Dayjs | null, Dayjs | null] | null
}

const TREND_MAP: Record<MarketTrend, { label: string; color: string }> = {
  big_rise: { label: '大涨', color: '#F5222D' },
  small_rise: { label: '小涨', color: '#FA8C16' },
  flat: { label: '平盘', color: '#8C8C8C' },
  small_fall: { label: '小跌', color: '#52C41A' },
  big_fall: { label: '大跌', color: '#389E0D' },
}

const ListView: React.FC<ListViewProps> = ({
  data, loading, pagination, onPaginationChange, onDateRangeChange, onRowClick, dateRange,
}) => {
  const columns: ColumnsType<TodaySummary> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '大盘走势',
      dataIndex: ['marketComment', 'trend'],
      key: 'trend',
      width: 100,
      render: (trend: MarketTrend | null) => {
        if (!trend) return '-'
        const config = TREND_MAP[trend]
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '今日盈亏',
      dataIndex: ['profitLoss', 'todayProfit'],
      key: 'todayProfit',
      width: 120,
      sorter: (a, b) => (a.profitLoss.todayProfit || 0) - (b.profitLoss.todayProfit || 0),
      render: (profit: number | null) => {
        if (profit === null) return '-'
        const color = profit >= 0 ? '#F5222D' : '#52C41A'
        return <Text style={{ color, fontWeight: 500 }}>{profit >= 0 ? '+' : ''}{profit.toFixed(2)}</Text>
      },
    },
    {
      title: '盈亏比例',
      dataIndex: ['profitLoss', 'todayProfitRate'],
      key: 'todayProfitRate',
      width: 100,
      sorter: (a, b) => (a.profitLoss.todayProfitRate || 0) - (b.profitLoss.todayProfitRate || 0),
      render: (rate: number | null) => {
        if (rate === null) return '-'
        const color = rate >= 0 ? '#F5222D' : '#52C41A'
        return <Text style={{ color }}>{rate >= 0 ? '+' : ''}{rate.toFixed(2)}%</Text>
      },
    },
    {
      title: '交易笔数',
      dataIndex: 'tradeRecords',
      key: 'tradeCount',
      width: 100,
      render: (records: TodaySummary['tradeRecords']) => records?.length || 0,
    },
    {
      title: '热点板块',
      dataIndex: ['marketComment', 'hotSectors'],
      key: 'hotSectors',
      ellipsis: true,
      render: (sectors: string[]) => {
        if (!sectors || sectors.length === 0) return '-'
        return (
          <Space wrap size={[4, 4]}>
            {sectors.slice(0, 3).map(s => <Tag key={s} color="blue">{s}</Tag>)}
            {sectors.length > 3 && <Text type="secondary">+{sectors.length - 3}</Text>}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Text>日期范围:</Text>
          <RangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            allowClear
            placeholder={['开始日期', '结束日期']}
          />
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: onPaginationChange,
        }}
        onRow={(record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: 'pointer' },
        })}
        scroll={{ x: 800 }}
      />
    </div>
  )
}

export default ListView
