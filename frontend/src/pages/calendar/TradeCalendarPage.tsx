import React, { useEffect, useState, useMemo } from 'react'
import { Calendar, Card, Badge, Typography, Space, Tag, Modal, List, Spin, Row, Col, Statistic, Button, Tooltip } from 'antd'
import { LeftOutlined, RightOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { tradeService, type Trade } from '@/services'
import { useThemeStore } from '@/stores'
import TradeDetailModal from '../diary/components/TradeDetailModal'

const { Text, Title } = Typography

interface DayTradeData {
  date: string
  trades: Trade[]
  totalAmount: number
  tradeCount: number
}

const TradeCalendarPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [tradeData, setTradeData] = useState<Map<string, DayTradeData>>(new Map())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<{ code: string; name: string } | null>(null)
  const { mode } = useThemeStore()

  // 月度统计
  const monthStats = useMemo(() => {
    const days = Array.from(tradeData.values())
    const totalBuys = days.reduce((sum, d) => sum + d.trades.filter(t => t.direction === 'BUY').length, 0)
    const totalSells = days.reduce((sum, d) => sum + d.trades.filter(t => t.direction === 'SELL').length, 0)
    const totalAmount = days.reduce((sum, d) => sum + Math.abs(d.totalAmount), 0)
    const netAmount = days.reduce((sum, d) => sum + d.totalAmount, 0)
    return { tradeDays: days.length, totalBuys, totalSells, totalAmount, netAmount }
  }, [tradeData])

  const fetchMonthTrades = async (month: Dayjs) => {
    setLoading(true)
    try {
      const startDate = month.startOf('month').format('YYYY-MM-DD')
      const endDate = month.endOf('month').format('YYYY-MM-DD')

      const response = await tradeService.getTrades({ startDate, endDate })
      const trades = response.data.data || []

      // 按日期分组
      const dataMap = new Map<string, DayTradeData>()
      trades.forEach((trade: Trade) => {
        const date = dayjs(trade.diary?.date || trade.createdAt).format('YYYY-MM-DD')
        if (!dataMap.has(date)) {
          dataMap.set(date, { date, trades: [], totalAmount: 0, tradeCount: 0 })
        }
        const dayData = dataMap.get(date)!
        dayData.trades.push(trade)
        dayData.tradeCount++
        // 计算当日交易金额（买入为负，卖出为正）
        if (trade.direction === 'SELL') {
          dayData.totalAmount += trade.amount
        } else {
          dayData.totalAmount -= trade.amount
        }
      })

      setTradeData(dataMap)
    } catch (error) {
      console.error('Failed to fetch trades:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthTrades(currentMonth)
  }, [currentMonth])

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    const dayData = tradeData.get(dateStr)

    if (!dayData) return null

    const isPositive = dayData.totalAmount > 0
    const isNegative = dayData.totalAmount < 0

    // 热力图颜色强度
    const maxAmount = Math.max(...Array.from(tradeData.values()).map(d => Math.abs(d.totalAmount)), 1)
    const intensity = Math.min(Math.abs(dayData.totalAmount) / maxAmount, 1)
    const bgColor = isPositive
      ? `rgba(16, 185, 129, ${0.1 + intensity * 0.3})`
      : isNegative
        ? `rgba(239, 68, 68, ${0.1 + intensity * 0.3})`
        : mode === 'dark' ? 'rgba(100,100,100,0.2)' : 'rgba(200,200,200,0.3)'

    return (
      <Tooltip title={`${dayData.tradeCount}笔交易，净额: ${dayData.totalAmount >= 0 ? '+' : ''}${dayData.totalAmount.toFixed(0)}`}>
        <div style={{
          padding: 4,
          borderRadius: 4,
          backgroundColor: bgColor,
          minHeight: 40,
          cursor: 'pointer'
        }}>
          <Badge
            count={dayData.tradeCount}
            size="small"
            style={{ backgroundColor: isPositive ? '#10B981' : isNegative ? '#EF4444' : '#6B7280' }}
          />
          {dayData.totalAmount !== 0 && (
            <div style={{ fontSize: 10, color: isPositive ? '#10B981' : '#EF4444', fontWeight: 500 }}>
              {isPositive ? '+' : ''}{dayData.totalAmount.toFixed(0)}
            </div>
          )}
        </div>
      </Tooltip>
    )
  }

  const onSelect = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    const dayData = tradeData.get(dateStr)
    if (dayData && dayData.trades.length > 0) {
      setSelectedDate(dateStr)
      setModalVisible(true)
    }
  }

  const onPanelChange = (value: Dayjs) => {
    setCurrentMonth(value)
  }

  const selectedDayData = selectedDate ? tradeData.get(selectedDate) : null

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'))
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'))
  const handleToday = () => setCurrentMonth(dayjs())

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          交易日历
        </Title>
        <Space>
          <Button icon={<LeftOutlined />} onClick={handlePrevMonth} />
          <Button onClick={handleToday}>今天</Button>
          <Button icon={<RightOutlined />} onClick={handleNextMonth} />
        </Space>
      </div>

      {/* 月度统计卡片 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={4}>
            <Statistic title="交易天数" value={monthStats.tradeDays} suffix="天" />
          </Col>
          <Col span={5}>
            <Statistic
              title="买入次数"
              value={monthStats.totalBuys}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowUpOutlined />}
              suffix="次"
            />
          </Col>
          <Col span={5}>
            <Statistic
              title="卖出次数"
              value={monthStats.totalSells}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowDownOutlined />}
              suffix="次"
            />
          </Col>
          <Col span={5}>
            <Statistic title="交易总额" value={monthStats.totalAmount} precision={0} prefix="¥" />
          </Col>
          <Col span={5}>
            <Statistic
              title="当月净额"
              value={monthStats.netAmount}
              precision={0}
              prefix="¥"
              valueStyle={{ color: monthStats.netAmount >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 日历主体 */}
      <Spin spinning={loading}>
        <Card>
          <Calendar
            value={currentMonth}
            cellRender={(current, info) => {
              if (info.type === 'date') return dateCellRender(current)
              return info.originNode
            }}
            onSelect={onSelect}
            onPanelChange={onPanelChange}
          />
        </Card>
      </Spin>

      <Modal
        title={`${selectedDate} 交易记录`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={650}
      >
        {selectedDayData && (
          <>
            <Space style={{ marginBottom: 16 }}>
              <Tag>交易次数: {selectedDayData.tradeCount}</Tag>
              <Tag color={selectedDayData.totalAmount >= 0 ? 'green' : 'red'}>
                当日净额: {selectedDayData.totalAmount >= 0 ? '+' : ''}{selectedDayData.totalAmount.toFixed(2)}
              </Tag>
            </Space>
            <List
              dataSource={selectedDayData.trades}
              renderItem={(trade) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedStock({ code: trade.stockCode, name: trade.stockName })
                    setDetailModalVisible(true)
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Space>
                        <Text strong>{trade.stockName}</Text>
                        <Text type="secondary">{trade.stockCode}</Text>
                        <Tag color={trade.direction === 'BUY' ? 'red' : 'green'}>
                          {trade.direction === 'BUY' ? '买入' : '卖出'}
                        </Tag>
                      </Space>
                      <Space>
                        <Text>¥{Number(trade.price).toFixed(2)}</Text>
                        <Text type="secondary">x{trade.quantity}</Text>
                        <Text type="secondary">¥{Number(trade.amount).toFixed(2)}</Text>
                      </Space>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>

      {/* 股票详情模态框 */}
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
    </div>
  )
}

export default TradeCalendarPage
