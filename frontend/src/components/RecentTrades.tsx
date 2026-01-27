import React, { useEffect, useState } from 'react'
import { List, Tag, Typography, Space, Spin, Empty } from 'antd'
import { tradeService, type Trade } from '@/services'
import dayjs from 'dayjs'

const { Text } = Typography

const RecentTrades: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true)
      try {
        const response = await tradeService.getTrades({ limit: 10 })
        setTrades(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch trades:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrades()
  }, [])

  if (loading) return <Spin />

  if (trades.length === 0) {
    return <Empty description="暂无交易记录" />
  }

  return (
    <List
      size="small"
      dataSource={trades}
      renderItem={(trade) => (
        <List.Item>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Text strong>{trade.stockName}</Text>
              <Tag color={trade.direction === 'BUY' ? 'red' : 'green'}>
                {trade.direction === 'BUY' ? '买' : '卖'}
              </Tag>
            </Space>
            <Space>
              <Text>¥{trade.price.toFixed(2)}</Text>
              <Text type="secondary">{dayjs(trade.diary?.date || trade.createdAt).format('MM-DD')}</Text>
            </Space>
          </div>
        </List.Item>
      )}
    />
  )
}

export default RecentTrades
