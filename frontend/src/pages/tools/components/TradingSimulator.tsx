import React, { useState } from 'react'
import { Card, Form, Input, InputNumber, Button, Table, Space, Statistic, Row, Col, Tag } from 'antd'

interface SimTrade {
  id: string
  stockName: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
  time: string
}

const TradingSimulator: React.FC = () => {
  const [trades, setTrades] = useState<SimTrade[]>([])
  const [balance, setBalance] = useState(100000)
  const [form] = Form.useForm()

  const handleTrade = (type: 'buy' | 'sell') => {
    form.validateFields().then((values) => {
      const amount = values.price * values.quantity
      if (type === 'buy' && amount > balance) return

      const newTrade: SimTrade = {
        id: Date.now().toString(),
        stockName: values.stockName,
        type,
        price: values.price,
        quantity: values.quantity,
        time: new Date().toLocaleString(),
      }

      setTrades([newTrade, ...trades])
      setBalance(type === 'buy' ? balance - amount : balance + amount)
      form.resetFields()
    })
  }

  const handleReset = () => {
    setTrades([])
    setBalance(100000)
  }

  const totalValue = trades.reduce((sum, t) => {
    return sum + (t.type === 'buy' ? -1 : 1) * t.price * t.quantity
  }, 100000)

  return (
    <Card title="交易模拟器" extra={<Button onClick={handleReset}>重置</Button>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="可用资金" value={balance.toFixed(2)} prefix="¥" />
        </Col>
        <Col span={8}>
          <Statistic title="账户总值" value={totalValue.toFixed(2)} prefix="¥" />
        </Col>
        <Col span={8}>
          <Statistic
            title="模拟盈亏"
            value={(totalValue - 100000).toFixed(2)}
            prefix="¥"
            valueStyle={{ color: totalValue >= 100000 ? '#cf1322' : '#3f8600' }}
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
          { title: '时间', dataIndex: 'time', key: 'time', width: 160 },
          { title: '股票', dataIndex: 'stockName', key: 'stockName' },
          { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => (
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
    </Card>
  )
}

export default TradingSimulator
