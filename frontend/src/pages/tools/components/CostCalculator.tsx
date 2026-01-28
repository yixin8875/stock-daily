import React, { useState, useEffect } from 'react'
import { Card, Form, InputNumber, Button, Table, Space, Row, Col, Statistic, message, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons'
import { costService, type CostRecord } from '@/services'

const CostCalculator: React.FC = () => {
  const [records, setRecords] = useState<CostRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await costService.getAll()
      setRecords(res.data.data || [])
    } catch {
      message.error('获取记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleAdd = async (type: 'buy' | 'sell') => {
    const values = form.getFieldsValue()
    if (!values.price || !values.quantity) return

    try {
      await costService.add({
        tradeType: type,
        price: values.price,
        quantity: values.quantity,
      })
      message.success('添加成功')
      form.resetFields()
      fetchRecords()
    } catch {
      message.error('添加失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await costService.delete(id)
      message.success('删除成功')
      fetchRecords()
    } catch {
      message.error('删除失败')
    }
  }

  const handleClear = async () => {
    try {
      await costService.clear()
      message.success('清空成功')
      setRecords([])
    } catch {
      message.error('清空失败')
    }
  }

  const calculate = () => {
    let totalShares = 0
    let totalCost = 0

    records.forEach((r) => {
      if (r.tradeType === 'buy') {
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
      dataIndex: 'tradeType',
      key: 'tradeType',
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
      render: (_: unknown, r: CostRecord) => (r.price * r.quantity).toFixed(2),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: CostRecord) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
      ),
    },
  ]

  return (
    <Card title="持仓成本计算器" extra={<Button icon={<ClearOutlined />} onClick={handleClear}>清空</Button>}>
      <Spin spinning={loading}>
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
      </Spin>
    </Card>
  )
}

export default CostCalculator
