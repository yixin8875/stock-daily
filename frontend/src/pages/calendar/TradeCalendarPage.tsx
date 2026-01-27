import React, { useEffect, useState } from 'react'
import { Calendar, Card, Badge, Typography, Space, Tag, Modal, List, Spin } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { tradeService, type Trade } from '@/services'

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

    return (
      <div style={{ padding: 2 }}>
        <Badge
          count={dayData.tradeCount}
          size="small"
          style={{ backgroundColor: isPositive ? '#10B981' : isNegative ? '#EF4444' : '#6B7280' }}
        />
        {dayData.totalAmount !== 0 && (
          <div style={{ fontSize: 10, color: isPositive ? '#10B981' : '#EF4444' }}>
            {isPositive ? '+' : ''}{dayData.totalAmount.toFixed(0)}
          </div>
        )}
      </div>
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

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>交易日历</Title>

      <Spin spinning={loading}>
        <Card>
          <Calendar
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
        width={600}
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
                <List.Item>
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
                        <Text>¥{trade.price.toFixed(2)}</Text>
                        <Text type="secondary">x{trade.quantity}</Text>
                        <Text type="secondary">¥{trade.amount.toFixed(2)}</Text>
                      </Space>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </div>
  )
}

export default TradeCalendarPage
