import React, { useEffect, useState } from 'react'
import { Card, List, Tag, Space, Typography, Empty, Spin, Badge, Collapse, Button } from 'antd'
import {
  BellOutlined,
  RiseOutlined,
  FallOutlined,
  StopOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { reminderService, type TodayReminder } from '@/services'
import { useThemeStore } from '@/stores'

const { Text } = Typography

const WATCH_LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  HIGH: { label: '重点', color: 'red' },
  NORMAL: { label: '一般', color: 'blue' },
  LOW: { label: '观察', color: 'default' },
}

const TodayReminders: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [reminders, setReminders] = useState<TodayReminder | null>(null)
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

  useEffect(() => {
    fetchReminders()
  }, [])

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{item.stockName}</Text>
                  <Text type="secondary">{item.stockCode}</Text>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{item.stockName}</Text>
                  <Text type="secondary">{item.stockCode}</Text>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>{item.stockName}</Text>
                  <Text type="secondary">{item.stockCode}</Text>
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
            return (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{item.stockName}</Text>
                    <Space>
                      <Tag color={levelConfig.color}>{levelConfig.label}</Tag>
                      <Text type="secondary">{item.stockCode}</Text>
                    </Space>
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
        <Button icon={<ReloadOutlined />} size="small" onClick={fetchReminders} loading={loading}>
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
