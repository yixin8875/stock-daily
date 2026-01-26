import React, { useEffect, useState } from 'react'
import { Card, Table, Spin, Empty, Tag, Button, DatePicker, Space, Statistic, Row, Col } from 'antd'
import { EyeOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { tradeService, type StockSummary, type TotalStats } from '@/services'
import TradeDetailModal from '@/pages/diary/components/TradeDetailModal'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const StockTradesSummary: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [stockSummaries, setStockSummaries] = useState<StockSummary[]>([])
  const [totalStats, setTotalStats] = useState<TotalStats | null>(null)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<{ code: string; name: string } | null>(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const params: { startDate?: string; endDate?: string } = {}
      if (dateRange && dateRange[0]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD')
      }
      if (dateRange && dateRange[1]) {
        params.endDate = dateRange[1].format('YYYY-MM-DD')
      }

      const res = await tradeService.getStatistics(params)
      if (res.data.success) {
        setStockSummaries(res.data.stockSummaries || [])
        setTotalStats(res.data.totalStats || null)
      }
    } catch (error) {
      console.error('获取交易统计失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (stockCode: string, stockName: string) => {
    setSelectedStock({ code: stockCode, name: stockName })
    setDetailModalVisible(true)
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      width: 100,
    },
    {
      title: '股票名称',
      dataIndex: 'stockName',
      key: 'stockName',
      width: 100,
    },
    {
      title: '买入/卖出',
      key: 'tradeCount',
      width: 100,
      render: (_: unknown, record: StockSummary) => (
        <span>
          <Tag color="red">{record.buyCount}</Tag>
          /
          <Tag color="green">{record.sellCount}</Tag>
        </span>
      ),
    },
    {
      title: '平均买入价',
      dataIndex: 'avgBuyPrice',
      key: 'avgBuyPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '平均卖出价',
      dataIndex: 'avgSellPrice',
      key: 'avgSellPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '持仓数量',
      dataIndex: 'holdingQuantity',
      key: 'holdingQuantity',
      width: 100,
      render: (quantity: number) => quantity > 0 ? <Tag color="blue">{quantity}</Tag> : '-',
    },
    {
      title: '已实现盈亏',
      dataIndex: 'realizedProfit',
      key: 'realizedProfit',
      width: 120,
      sorter: (a: StockSummary, b: StockSummary) => a.realizedProfit - b.realizedProfit,
      render: (profit: number) => (
        <span style={{ color: profit >= 0 ? '#3f8600' : '#cf1322', fontWeight: 500 }}>
          {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: StockSummary) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.stockCode, record.stockName)}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <>
      <Card
        title="股票交易汇总"
        extra={
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              placeholder={['开始日期', '结束日期']}
            />
            <Button type="primary" onClick={fetchStatistics}>
              查询
            </Button>
          </Space>
        }
      >
        <Spin spinning={loading}>
          {totalStats && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic title="交易股票数" value={totalStats.uniqueStocks} suffix="只" />
              </Col>
              <Col span={6}>
                <Statistic title="总交易次数" value={totalStats.totalTrades} suffix="次" />
              </Col>
              <Col span={6}>
                <Statistic
                  title="总买入金额"
                  value={totalStats.totalBuyAmount}
                  precision={2}
                  prefix="¥"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="总已实现盈亏"
                  value={totalStats.totalRealizedProfit}
                  precision={2}
                  valueStyle={{ color: totalStats.totalRealizedProfit >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={totalStats.totalRealizedProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="元"
                />
              </Col>
            </Row>
          )}

          {stockSummaries.length > 0 ? (
            <Table
              columns={columns}
              dataSource={stockSummaries}
              rowKey="stockCode"
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          ) : (
            <Empty description="暂无交易数据" />
          )}
        </Spin>
      </Card>

      {selectedStock && (
        <TradeDetailModal
          visible={detailModalVisible}
          stockCode={selectedStock.code}
          stockName={selectedStock.name}
          onClose={() => {
            setDetailModalVisible(false)
            setSelectedStock(null)
          }}
        />
      )}
    </>
  )
}

export default StockTradesSummary
