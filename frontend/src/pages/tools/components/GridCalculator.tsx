import React, { useState } from 'react'
import { Card, Form, InputNumber, Button, Table, Row, Col, Statistic, Alert } from 'antd'
import { CalculatorOutlined } from '@ant-design/icons'

interface GridLevel {
  level: number
  price: number
  action: 'buy' | 'sell'
  quantity: number
  amount: number
}

const GridCalculator: React.FC = () => {
  const [form] = Form.useForm()
  const [gridLevels, setGridLevels] = useState<GridLevel[]>([])
  const [summary, setSummary] = useState<{ totalAmount: number; avgPrice: number; gridCount: number } | null>(null)

  const handleCalculate = (values: {
    basePrice: number
    upperPrice: number
    lowerPrice: number
    gridCount: number
    totalAmount: number
  }) => {
    const { basePrice, upperPrice, lowerPrice, gridCount, totalAmount } = values
    const gridStep = (upperPrice - lowerPrice) / gridCount
    const amountPerGrid = totalAmount / gridCount

    const levels: GridLevel[] = []
    for (let i = 0; i <= gridCount; i++) {
      const price = lowerPrice + gridStep * i
      const quantity = Math.floor(amountPerGrid / price / 100) * 100
      levels.push({
        level: i,
        price: Number(price.toFixed(2)),
        action: price < basePrice ? 'buy' : 'sell',
        quantity,
        amount: Number((quantity * price).toFixed(2)),
      })
    }

    setGridLevels(levels)
    setSummary({
      totalAmount: levels.reduce((sum, l) => sum + l.amount, 0),
      avgPrice: basePrice,
      gridCount,
    })
  }

  const columns = [
    { title: '档位', dataIndex: 'level', key: 'level' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v.toFixed(2)}` },
    {
      title: '操作', dataIndex: 'action', key: 'action',
      render: (v: string) => <span style={{ color: v === 'buy' ? '#10B981' : '#EF4444' }}>{v === 'buy' ? '买入' : '卖出'}</span>
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (v: number) => `${v}股` },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toFixed(2)}` },
  ]

  return (
    <Card title={<><CalculatorOutlined style={{ marginRight: 8 }} />网格交易计算器</>}>
      <Alert
        type="info"
        message="网格交易策略"
        description="在设定的价格区间内，按固定间隔设置买卖点，低买高卖赚取波动收益"
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="inline" onFinish={handleCalculate} style={{ marginBottom: 16 }}>
        <Form.Item name="basePrice" label="基准价" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="upperPrice" label="上限价" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="lowerPrice" label="下限价" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="gridCount" label="网格数" rules={[{ required: true }]} initialValue={10}>
          <InputNumber min={2} max={50} style={{ width: 80 }} />
        </Form.Item>
        <Form.Item name="totalAmount" label="总资金" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: 120 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">计算</Button>
        </Form.Item>
      </Form>

      {summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}><Statistic title="网格数量" value={summary.gridCount} suffix="档" /></Col>
          <Col span={8}><Statistic title="预计投入" value={summary.totalAmount} precision={2} prefix="¥" /></Col>
          <Col span={8}><Statistic title="基准价格" value={summary.avgPrice} precision={2} prefix="¥" /></Col>
        </Row>
      )}

      {gridLevels.length > 0 && (
        <Table columns={columns} dataSource={gridLevels} rowKey="level" pagination={false} size="small" />
      )}
    </Card>
  )
}

export default GridCalculator
