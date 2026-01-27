import React, { useEffect, useState } from 'react'
import { Card, Table, DatePicker, Space, Typography, Tag, Statistic, Row, Col, Spin, Empty } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { analysisService, type TradeReview } from '@/services'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const TradeReviewPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState<TradeReview[]>([])
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(1, 'month'),
    dayjs(),
  ])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [startDate, endDate] = dateRange
      const res = await analysisService.getTradeReviews(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      )
      setReviews(res.data.data || [])
    } catch (error) {
      console.error('获取交易复盘失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const closedTrades = reviews.filter(r => r.status === 'closed')
  const openTrades = reviews.filter(r => r.status === 'open')
  const winningTrades = closedTrades.filter(r => (r.profit || 0) > 0)
  const totalProfit = closedTrades.reduce((sum, r) => sum + (r.profit || 0), 0)
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: unknown, record: TradeReview) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </Space>
      ),
    },
    {
      title: '买入',
      key: 'buy',
      render: (_: unknown, record: TradeReview) => (
        <Space direction="vertical" size={0}>
          <Text>{record.buyDate}</Text>
          <Text type="secondary">¥{record.buyPrice} × {record.buyQuantity}</Text>
        </Space>
      ),
    },
    {
      title: '卖出',
      key: 'sell',
      render: (_: unknown, record: TradeReview) => {
        if (record.status === 'open') {
          return <Tag color="blue">持仓中</Tag>
        }
        return (
          <Space direction="vertical" size={0}>
            <Text>{record.sellDate}</Text>
            <Text type="secondary">¥{record.sellPrice} × {record.sellQuantity}</Text>
          </Space>
        )
      },
    },
    {
      title: '持仓天数',
      dataIndex: 'holdingDays',
      key: 'holdingDays',
      render: (v: number) => `${v}天`,
    },
    {
      title: '盈亏',
      key: 'profit',
      render: (_: unknown, record: TradeReview) => {
        if (record.status === 'open' || record.profit === null) {
          return <Text type="secondary">--</Text>
        }
        const isProfit = record.profit >= 0
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ color: isProfit ? '#EF4444' : '#10B981' }}>
              {isProfit ? '+' : ''}¥{record.profit.toFixed(2)}
            </Text>
            <Tag color={isProfit ? 'red' : 'green'}>
              {isProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(record.profitRate || 0).toFixed(2)}%
            </Tag>
          </Space>
        )
      },
    },
    {
      title: '买入理由',
      dataIndex: 'buyReason',
      key: 'buyReason',
      ellipsis: true,
      render: (v: string | null) => v || <Text type="secondary">--</Text>,
    },
    {
      title: '卖出理由',
      dataIndex: 'sellReason',
      key: 'sellReason',
      ellipsis: true,
      render: (v: string | null) => v || <Text type="secondary">--</Text>,
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>交易复盘</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="已完成交易" value={closedTrades.length} suffix="笔" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="持仓中" value={openTrades.length} suffix="笔" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="胜率"
              value={winRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: winRate >= 50 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="总盈亏"
              value={totalProfit}
              precision={2}
              prefix={totalProfit >= 0 ? '+¥' : '¥'}
              valueStyle={{ color: totalProfit >= 0 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Spin spinning={loading}>
          {reviews.length > 0 ? (
            <Table
              columns={columns}
              dataSource={reviews}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          ) : (
            <Empty description="暂无交易记录" />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default TradeReviewPage
