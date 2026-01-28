import React, { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Button, Table, Space, Statistic, Row, Col, Tag, message, Spin } from 'antd'
import { simulatorService, type SimulatedTrade, type SimulatedAccount } from '@/services'

const TradingSimulator: React.FC = () => {
  const [trades, setTrades] = useState<SimulatedTrade[]>([])
  const [account, setAccount] = useState<SimulatedAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [accountRes, tradesRes] = await Promise.all([
        simulatorService.getAccount(),
        simulatorService.getTrades(),
      ])
      setAccount(accountRes.data.data || null)
      setTrades(tradesRes.data.data || [])
    } catch {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTrade = async (type: 'buy' | 'sell') => {
    try {
      const values = await form.validateFields()
      const amount = values.price * values.quantity
      const balance = account?.currentBalance || 0
      if (type === 'buy' && amount > balance) {
        message.warning('余额不足')
        return
      }

      await simulatorService.createTrade({
        stockName: values.stockName,
        tradeType: type,
        price: values.price,
        quantity: values.quantity,
      })
      message.success(type === 'buy' ? '买入成功' : '卖出成功')
      form.resetFields()
      fetchData()
    } catch {
      message.error('交易失败')
    }
  }

  const handleReset = async () => {
    try {
      await simulatorService.reset()
      message.success('重置成功')
      fetchData()
    } catch {
      message.error('重置失败')
    }
  }

  const balance = account?.currentBalance || 100000
  const initialBalance = account?.initialBalance || 100000

  return (
    <Card title="交易模拟器" extra={<Button onClick={handleReset}>重置</Button>}>
      <Spin spinning={loading}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="可用资金" value={balance.toFixed(2)} prefix="¥" />
        </Col>
        <Col span={8}>
          <Statistic title="初始资金" value={initialBalance.toFixed(2)} prefix="¥" />
        </Col>
        <Col span={8}>
          <Statistic
            title="模拟盈亏"
            value={(balance - initialBalance).toFixed(2)}
            prefix="¥"
            valueStyle={{ color: balance >= initialBalance ? '#cf1322' : '#3f8600' }}
          />
        </Col>
      </Row>

      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="stockName" rules={[{ required: true }]}>
          <Input placeholder="股票名称" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="price" rules={[{ required: true }]}>
          <InputNumber placeholder="价格" min={0} precision={2} style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="quantity" rules={[{ required: true }]}>
          <InputNumber placeholder="数量" min={100} step={100} style={{ width: 100 }} />
        </Form.Item>
        <Space>
          <Button type="primary" danger onClick={() => handleTrade('buy')}>买入</Button>
          <Button type="primary" style={{ background: '#3f8600' }} onClick={() => handleTrade('sell')}>卖出</Button>
        </Space>
      </Form>

      <Table
        columns={[
          { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
            render: (v: string) => v?.slice(0, 19).replace('T', ' ') },
          { title: '股票', dataIndex: 'stockName', key: 'stockName' },
          { title: '类型', dataIndex: 'tradeType', key: 'tradeType', render: (v: string) => (
            <Tag color={v === 'buy' ? 'red' : 'green'}>{v === 'buy' ? '买入' : '卖出'}</Tag>
          )},
          { title: '价格', dataIndex: 'price', key: 'price' },
          { title: '数量', dataIndex: 'quantity', key: 'quantity' },
        ]}
        dataSource={trades}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
      />
      </Spin>
    </Card>
  )
}

export default TradingSimulator
