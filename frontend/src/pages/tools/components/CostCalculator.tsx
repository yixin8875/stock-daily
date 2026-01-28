import React, { useState } from 'react'
import { Card, Form, InputNumber, Button, Table, Space, Row, Col, Statistic } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

interface TradeRecord {
  id: number
  type: 'buy' | 'sell'
  price: number
  quantity: number
}

const CostCalculator: React.FC = () => {
  const [records, setRecords] = useState<TradeRecord[]>([])
  const [form] = Form.useForm()
  const [idCounter, setIdCounter] = useState(1)

  const handleAdd = (type: 'buy' | 'sell') => {
    const values = form.getFieldsValue()
    if (!values.price || !values.quantity) return

    setRecords([
      ...records,
      { id: idCounter, type, price: values.price, quantity: values.quantity },
    ])
    setIdCounter(idCounter + 1)
    form.resetFields()
  }

  const handleDelete = (id: number) => {
    setRecords(records.filter((r) => r.id !== id))
  }

  const calculate = () => {
    let totalShares = 0
    let totalCost = 0

    records.forEach((r) => {
      if (r.type === 'buy') {
        totalShares += r.quantity
        totalCost += r.price * r.quantity
      } else {
        totalShares -= r.quantity
        totalCost -= r.price * r.quantity
      }
    })

    const avgCost = totalShares > 0 ? totalCost / totalShares : 0
    return { totalShares, totalCost, avgCost }
  }

  const { totalShares, totalCost, avgCost } = calculate()

  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => (
        <span style={{ color: v === 'buy' ? '#cf1322' : '#3f8600' }}>
          {v === 'buy' ? '买入' : '卖出'}
        </span>
      ),
    },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => v.toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '金额',
      key: 'amount',
      render: (_: unknown, r: TradeRecord) => (r.price * r.quantity).toFixed(2),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: TradeRecord) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
      ),
    },
  ]

  return (
    <Card title="持仓成本计算器">
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="price" label="价格">
          <InputNumber min={0} precision={2} placeholder="成交价" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="quantity" label="数量">
          <InputNumber min={1} precision={0} placeholder="股数" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" danger icon={<PlusOutlined />} onClick={() => handleAdd('buy')}>
              买入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('sell')} style={{ background: '#3f8600' }}>
              卖出
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table columns={columns} dataSource={records} rowKey="id" size="small" pagination={false} />

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Statistic title="持仓数量" value={totalShares} suffix="股" />
        </Col>
        <Col span={8}>
          <Statistic title="持仓成本" value={totalCost.toFixed(2)} prefix="¥" />
        </Col>
        <Col span={8}>
          <Statistic
            title="平均成本"
            value={avgCost.toFixed(2)}
            prefix="¥"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default CostCalculator
