import React, { useEffect, useState, useCallback } from 'react'
import { Card, List, Tag, Space, Typography, Empty, Spin, Badge, Collapse, Button } from 'antd'
import {
  BellOutlined,
  RiseOutlined,
  FallOutlined,
  StopOutlined,
  EyeOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { reminderService, stockService, type TodayReminder, type StockQuote } from '@/services'
import { useThemeStore } from '@/stores'

const { Text } = Typography

const WATCH_LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  HIGH: { label: '重点', color: 'red' },
  NORMAL: { label: '一般', color: 'blue' },
  LOW: { label: '观察', color: 'default' },
}

interface StockPriceProps {
  quote?: StockQuote
  targetPrice?: number
  type?: 'buy' | 'sell' | 'stop'
}

const StockPrice: React.FC<StockPriceProps> = ({ quote, targetPrice, type }) => {
  if (!quote) {
    return <Text type="secondary" style={{ fontSize: 12 }}>行情加载中...</Text>
  }

  const { price, change, changePercent } = quote
  const isUp = change >= 0

  // 计算与目标价的差距
  let distancePercent = 0
  let distanceText = ''
  if (targetPrice && price > 0) {
    distancePercent = ((price - targetPrice) / targetPrice) * 100
    if (type === 'buy') {
      distanceText = distancePercent <= 0 ? '已到目标价!' : `距目标价 ${Math.abs(distancePercent).toFixed(1)}%`
    } else if (type === 'sell') {
      distanceText = distancePercent >= 0 ? '已到目标价!' : `距目标价 ${Math.abs(distancePercent).toFixed(1)}%`
    } else if (type === 'stop') {
      distanceText = distancePercent <= 0 ? '已触发止损!' : `距止损价 ${Math.abs(distancePercent).toFixed(1)}%`
    }
  }

  const reachedTarget = (type === 'buy' && distancePercent <= 0) ||
    (type === 'sell' && distancePercent >= 0) ||
    (type === 'stop' && distancePercent <= 0)

  return (
    <Space direction="vertical" size={0} style={{ alignItems: 'flex-end' }}>
      <Space size={4}>
        <Text strong style={{ color: isUp ? '#EF4444' : '#10B981' }}>
          ¥{price.toFixed(2)}
        </Text>
        <Text style={{ color: isUp ? '#EF4444' : '#10B981', fontSize: 12 }}>
          {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(changePercent).toFixed(2)}%
        </Text>
      </Space>
      {distanceText && (
        <Text
          style={{
            fontSize: 11,
            color: reachedTarget ? '#EF4444' : '#6B7280',
            fontWeight: reachedTarget ? 600 : 400,
          }}
        >
          {distanceText}
        </Text>
      )}
    </Space>
  )
}

const TodayReminders: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [reminders, setReminders] = useState<TodayReminder | null>(null)
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [quotesLoading, setQuotesLoading] = useState(false)
  const { mode } = useThemeStore()

  const fetchReminders = async () => {
    setLoading(true)
    try {
      const res = await reminderService.getTodayReminders()
      setReminders(res.data)
    } catch (error) {
      console.error('获取提醒失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotes = useCallback(async () => {
    if (!reminders) return

    // 收集所有股票代码
    const codes = new Set<string>()
    reminders.buyPlans.forEach(p => codes.add(p.stockCode))
    reminders.sellPlans.forEach(p => codes.add(p.stockCode))
    reminders.stopLosses.forEach(p => codes.add(p.stockCode))
    reminders.watchStocks.forEach(p => codes.add(p.stockCode))

    if (codes.size === 0) return

    setQuotesLoading(true)
    try {
      const res = await stockService.getQuotes(Array.from(codes))
      const quotesMap: Record<string, StockQuote> = {}
      if (res.data.data) {
        res.data.data.forEach((q: StockQuote) => {
          quotesMap[q.code] = q
        })
      }
      setQuotes(quotesMap)
    } catch (error) {
      console.error('获取行情失败:', error)
    } finally {
      setQuotesLoading(false)
    }
  }, [reminders])

  useEffect(() => {
    fetchReminders()
  }, [])

  useEffect(() => {
    if (reminders) {
      fetchQuotes()
    }
  }, [reminders, fetchQuotes])

  const handleRefresh = () => {
    fetchReminders()
  }

  const totalCount = reminders
    ? reminders.summary.totalBuyPlans +
      reminders.summary.totalSellPlans +
      reminders.summary.totalStopLosses +
      reminders.summary.totalWatchStocks
    : 0

  const collapseItems = []

  if (reminders?.buyPlans.length) {
    collapseItems.push({
      key: 'buy',
      label: (
        <Space>
          <RiseOutlined style={{ color: '#EF4444' }} />
          <span>买入计划</span>
          <Badge count={reminders.buyPlans.length} style={{ backgroundColor: '#EF4444' }} />
        </Space>
      ),
      children: (
        <List
          size="small"
          dataSource={reminders.buyPlans}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text strong>{item.stockName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>{item.stockCode}</Text>
                  </div>
                  <StockPrice quote={quotes[item.stockCode]} targetPrice={item.targetPrice} type="buy" />
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag color="red">目标价: ¥{item.targetPrice}</Tag>
                  <Tag>仓位: {item.positionPercent}%</Tag>
                </div>
                {item.triggerCondition && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    触发条件: {item.triggerCondition}
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />
      ),
    })
  }

  if (reminders?.sellPlans.length) {
    collapseItems.push({
      key: 'sell',
      label: (
        <Space>
          <FallOutlined style={{ color: '#10B981' }} />
          <span>卖出计划</span>
          <Badge count={reminders.sellPlans.length} style={{ backgroundColor: '#10B981' }} />
        </Space>
      ),
      children: (
        <List
          size="small"
          dataSource={reminders.sellPlans}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text strong>{item.stockName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>{item.stockCode}</Text>
                  </div>
                  <StockPrice quote={quotes[item.stockCode]} targetPrice={item.targetPrice} type="sell" />
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag color="green">目标价: ¥{item.targetPrice}</Tag>
                  <Tag>卖出: {item.sellPercent}%</Tag>
                </div>
                {item.triggerCondition && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    触发条件: {item.triggerCondition}
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />
      ),
    })
  }

  if (reminders?.stopLosses.length) {
    collapseItems.push({
      key: 'stop',
      label: (
        <Space>
          <StopOutlined style={{ color: '#F59E0B' }} />
          <span>止损提醒</span>
          <Badge count={reminders.stopLosses.length} style={{ backgroundColor: '#F59E0B' }} />
        </Space>
      ),
      children: (
        <List
          size="small"
          dataSource={reminders.stopLosses}
          renderItem={(item) => (
            <List.Item>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text strong>{item.stockName}</Text>
                    <Text type="secondary" style={{ marginLeft: 8 }}>{item.stockCode}</Text>
                  </div>
                  <StockPrice quote={quotes[item.stockCode]} targetPrice={item.stopPrice} type="stop" />
                </div>
                <div style={{ marginTop: 4 }}>
                  <Tag color="orange">止损价: ¥{item.stopPrice}</Tag>
                  {item.costPrice && <Tag>成本: ¥{item.costPrice}</Tag>}
                </div>
              </div>
            </List.Item>
          )}
        />
      ),
    })
  }

  if (reminders?.watchStocks.length) {
    collapseItems.push({
      key: 'watch',
      label: (
        <Space>
          <EyeOutlined style={{ color: '#3B82F6' }} />
          <span>关注股票</span>
          <Badge count={reminders.watchStocks.length} style={{ backgroundColor: '#3B82F6' }} />
        </Space>
      ),
      children: (
        <List
          size="small"
          dataSource={reminders.watchStocks}
          renderItem={(item) => {
            const levelConfig = WATCH_LEVEL_LABELS[item.watchLevel] || WATCH_LEVEL_LABELS.NORMAL
            const quote = quotes[item.stockCode]
            return (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text strong>{item.stockName}</Text>
                      <Tag color={levelConfig.color} style={{ marginLeft: 8 }}>{levelConfig.label}</Tag>
                    </div>
                    {quote && (
                      <Space size={4}>
                        <Text strong style={{ color: quote.change >= 0 ? '#EF4444' : '#10B981' }}>
                          ¥{quote.price.toFixed(2)}
                        </Text>
                        <Text style={{ color: quote.change >= 0 ? '#EF4444' : '#10B981', fontSize: 12 }}>
                          {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                        </Text>
                      </Space>
                    )}
                  </div>
                  {item.watchReason && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                      {item.watchReason}
                    </Text>
                  )}
                </div>
              </List.Item>
            )
          }}
        />
      ),
    })
  }

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
            <BellOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>今日提醒</span>
          {totalCount > 0 && <Badge count={totalCount} style={{ backgroundColor: '#F59E0B' }} />}
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} size="small" onClick={handleRefresh} loading={loading || quotesLoading}>
          刷新
        </Button>
      }
    >
      <Spin spinning={loading}>
        {collapseItems.length > 0 ? (
          <Collapse
            items={collapseItems}
            defaultActiveKey={collapseItems.map((item) => item.key)}
            ghost
            style={{
              background: mode === 'dark' ? 'transparent' : '#FAFAFA',
              borderRadius: 8,
            }}
          />
        ) : (
          <Empty description="暂无待执行计划" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Spin>
    </Card>
  )
}

export default TodayReminders
