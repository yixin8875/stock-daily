import React, { useEffect, useState } from 'react'
import { Card, List, Button, Space, Typography, Tag, message, Empty, Spin, Badge, Switch } from 'antd'
import { BellOutlined, CheckOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { signalService, type TradeSignal, type SignalType, type SignalDirection } from '@/services'

const { Title, Text } = Typography

const signalTypeLabels: Record<SignalType, string> = {
  MA_CROSS: '均线交叉',
  MACD_CROSS: 'MACD交叉',
  KDJ_SIGNAL: 'KDJ信号',
  RSI_SIGNAL: 'RSI信号',
  VOLUME_BREAK: '放量突破',
  PRICE_BREAK: '价格突破',
  CUSTOM: '自定义',
}

const SignalPage: React.FC = () => {
  const [signals, setSignals] = useState<TradeSignal[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)

  const fetchSignals = async () => {
    setLoading(true)
    try {
      const res = await signalService.getSignals(unreadOnly)
      setSignals(res.data.data || [])
    } catch (error) {
      message.error('获取信号失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSignals() }, [unreadOnly])

  const handleMarkAsRead = async (id: string) => {
    try {
      await signalService.markAsRead(id)
      fetchSignals()
    } catch (error) {
      message.error('标记失败')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await signalService.markAllAsRead()
      message.success('已全部标记为已读')
      fetchSignals()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await signalService.deleteSignal(id)
      message.success('删除成功')
      fetchSignals()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const unreadCount = signals.filter(s => !s.isRead).length

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>交易信号</Title>
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </Space>
        <Space>
          <Switch
            checkedChildren="仅未读"
            unCheckedChildren="全部"
            checked={unreadOnly}
            onChange={setUnreadOnly}
          />
          <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            全部已读
          </Button>
        </Space>
      </div>

      <Card>
        <Spin spinning={loading}>
          {signals.length > 0 ? (
            <List
              dataSource={signals}
              renderItem={(signal) => (
                <List.Item
                  style={{
                    background: signal.isRead ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  actions={[
                    !signal.isRead && (
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => handleMarkAsRead(signal.id)}
                      >
                        已读
                      </Button>
                    ),
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(signal.id)}
                    />,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: signal.direction === 'BUY' ? '#EF4444' : '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {signal.direction === 'BUY' ? (
                          <ArrowUpOutlined style={{ color: '#fff', fontSize: 18 }} />
                        ) : (
                          <ArrowDownOutlined style={{ color: '#fff', fontSize: 18 }} />
                        )}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{signal.stockName}</Text>
                        <Text type="secondary">({signal.stockCode})</Text>
                        <Tag color={signal.direction === 'BUY' ? 'red' : 'green'}>
                          {signal.direction === 'BUY' ? '买入信号' : '卖出信号'}
                        </Tag>
                        {!signal.isRead && <Badge status="processing" />}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Tag color="blue">{signalTypeLabels[signal.signalType]}</Tag>
                          <Text type="secondary">{signal.indicator}</Text>
                          <Text>触发价: ¥{signal.price}</Text>
                        </Space>
                        {signal.description && <Text type="secondary">{signal.description}</Text>}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(signal.triggeredAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={<BellOutlined style={{ fontSize: 48, color: '#ccc' }} />}
              description="暂无交易信号"
            />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default SignalPage
