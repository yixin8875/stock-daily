import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Switch, Space, Spin, Empty } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import { signalService, type TradeSignal } from '@/services'

const SignalNotification: React.FC = () => {
  const [signals, setSignals] = useState<TradeSignal[]>([])
  const [loading, setLoading] = useState(false)
  const [notifyEnabled, setNotifyEnabled] = useState(true)

  useEffect(() => {
    fetchSignals()
  }, [])

  const fetchSignals = async () => {
    setLoading(true)
    try {
      const res = await signalService.getSignals()
      setSignals(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '股票', dataIndex: 'stockName', key: 'stockName', width: 80 },
    {
      title: '信号',
      dataIndex: 'direction',
      key: 'direction',
      render: (v: string) => (
        <Tag color={v === 'buy' ? 'red' : 'green'}>
          {v === 'buy' ? '买入' : '卖出'}
        </Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'signalType',
      key: 'signalType',
      render: (v: string) => {
        const types: Record<string, string> = {
          BREAKOUT: '突破',
          GOLDEN_CROSS: '金叉',
          DEATH_CROSS: '死叉',
          OVERSOLD: '超卖',
          OVERBOUGHT: '超买',
        }
        return types[v] || v
      },
    },
    { title: '触发价', dataIndex: 'triggerPrice', key: 'triggerPrice' },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
  ]

  return (
    <Card
      title={<><BellOutlined /> 交易信号</>}
      extra={
        <Space>
          <span>通知</span>
          <Switch checked={notifyEnabled} onChange={setNotifyEnabled} />
          <Button onClick={fetchSignals}>刷新</Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {signals.length === 0 ? (
          <Empty description="暂无信号" />
        ) : (
          <Table
            columns={columns}
            dataSource={signals}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Spin>
    </Card>
  )
}

export default SignalNotification
