import React, { useEffect, useState } from 'react'
import { Modal, Descriptions, Table, Statistic, Row, Col, Card, Tag, Spin, Empty, Divider } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, StockOutlined } from '@ant-design/icons'
import { tradeService, type Trade, type StockStatistics } from '@/services'
import dayjs from 'dayjs'

interface TradeDetailModalProps {
  visible: boolean
  stockCode: string
  stockName: string
  onClose: () => void
}

const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  visible,
  stockCode,
  stockName,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const [trades, setTrades] = useState<Trade[]>([])
  const [statistics, setStatistics] = useState<StockStatistics | null>(null)

  useEffect(() => {
    if (visible && stockCode) {
      fetchStockHistory()
    }
  }, [visible, stockCode])

  const fetchStockHistory = async () => {
    setLoading(true)
    try {
      const res = await tradeService.getStockHistory(stockCode)
      if (res.data.success) {
        setTrades(res.data.trades || [])
        setStatistics(res.data.statistics || null)
      }
    } catch (error) {
      console.error('获取股票交易历史失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '日期',
      dataIndex: ['diary', 'date'],
      key: 'date',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      width: 80,
      render: (direction: string) => (
        <Tag color={direction === 'BUY' ? 'red' : 'green'}>
          {direction === 'BUY' ? '买入' : '卖出'}
        </Tag>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number) => quantity.toLocaleString(),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (_: number, record: Trade) => `¥${(record.price * record.quantity).toLocaleString()}`,
    },
    {
      title: '交易原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
  ]

  return (
    <Modal
      title={
        <span>
          <StockOutlined style={{ marginRight: 8 }} />
          {stockName} ({stockCode}) - 交易详情
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {statistics && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="总交易次数"
                    value={statistics.totalTrades}
                    suffix="次"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="买入次数"
                    value={statistics.buyCount}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<ArrowUpOutlined />}
                    suffix="次"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="卖出次数"
                    value={statistics.sellCount}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<ArrowDownOutlined />}
                    suffix="次"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="已实现盈亏"
                    value={statistics.realizedProfit}
                    precision={2}
                    valueStyle={{ color: statistics.realizedProfit >= 0 ? '#3f8600' : '#cf1322' }}
                    prefix={statistics.realizedProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    suffix="元"
                  />
                </Card>
              </Col>
            </Row>

            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="平均买入价">
                ¥{statistics.avgBuyPrice.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="平均卖出价">
                ¥{statistics.avgSellPrice.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="总买入金额">
                ¥{statistics.totalBuyAmount.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="总卖出金额">
                ¥{statistics.totalSellAmount.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="持仓数量">
                {statistics.holdingQuantity.toLocaleString()} 股
              </Descriptions.Item>
              <Descriptions.Item label="持仓成本">
                ¥{statistics.holdingCost.toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        <Divider>交易历史</Divider>

        {trades.length > 0 ? (
          <Table
            columns={columns}
            dataSource={trades}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
          />
        ) : (
          <Empty description="暂无交易记录" />
        )}
      </Spin>
    </Modal>
  )
}

export default TradeDetailModal
