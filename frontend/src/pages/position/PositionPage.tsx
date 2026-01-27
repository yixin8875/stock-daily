import React, { useEffect, useState, useCallback } from 'react'
import {
  Card, Table, Button, Space, Typography, Tag, message, Modal, Form, Input,
  InputNumber, Statistic, Row, Col, Popconfirm, Empty, Spin
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, EditOutlined, MinusOutlined,
  ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined
} from '@ant-design/icons'
import { positionService, stockService, type Position, type StockQuote } from '@/services'

const { Title, Text } = Typography

const PositionPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([])
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [reduceModalVisible, setReduceModalVisible] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [form] = Form.useForm()
  const [reduceForm] = Form.useForm()

  const fetchPositions = async () => {
    setLoading(true)
    try {
      const res = await positionService.getPositions()
      setPositions(res.data.data || [])
    } catch (error) {
      message.error('获取持仓失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotes = useCallback(async () => {
    if (positions.length === 0) return
    try {
      const codes = positions.map(p => p.stockCode)
      const res = await stockService.getQuotes(codes)
      const quotesMap: Record<string, StockQuote> = {}
      res.data.data?.forEach((q: StockQuote) => {
        quotesMap[q.code] = q
      })
      setQuotes(quotesMap)
    } catch (error) {
      console.error('获取行情失败:', error)
    }
  }, [positions])

  useEffect(() => {
    fetchPositions()
  }, [])

  useEffect(() => {
    fetchQuotes()
    const interval = setInterval(fetchQuotes, 10000)
    return () => clearInterval(interval)
  }, [fetchQuotes])

  const handleAdd = () => {
    setEditingPosition(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (position: Position) => {
    setEditingPosition(position)
    form.setFieldsValue(position)
    setModalVisible(true)
  }

  const handleReduce = (position: Position) => {
    setEditingPosition(position)
    reduceForm.setFieldsValue({ quantity: position.quantity })
    setReduceModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingPosition) {
        await positionService.updatePosition(editingPosition.id, values)
        message.success('更新成功')
      } else {
        await positionService.addPosition(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      fetchPositions()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReduceSubmit = async () => {
    try {
      const values = await reduceForm.validateFields()
      if (editingPosition) {
        await positionService.reducePosition(editingPosition.id, values.quantity)
        message.success('减仓成功')
        setReduceModalVisible(false)
        fetchPositions()
      }
    } catch (error) {
      message.error('减仓失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await positionService.deletePosition(id)
      message.success('删除成功')
      fetchPositions()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const summary = positions.reduce((acc, p) => {
    const quote = quotes[p.stockCode]
    const currentPrice = quote?.price || p.costPrice
    const marketValue = currentPrice * p.quantity
    const profit = marketValue - p.totalCost
    return {
      totalCost: acc.totalCost + p.totalCost,
      totalMarketValue: acc.totalMarketValue + marketValue,
      totalProfit: acc.totalProfit + profit,
    }
  }, { totalCost: 0, totalMarketValue: 0, totalProfit: 0 })

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: unknown, record: Position) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </Space>
      ),
    },
    { title: '持仓数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '现价',
      key: 'currentPrice',
      render: (_: unknown, record: Position) => {
        const quote = quotes[record.stockCode]
        if (!quote) return <Text type="secondary">--</Text>
        const isUp = quote.price >= record.costPrice
        return (
          <Text style={{ color: isUp ? '#EF4444' : '#10B981' }}>
            ¥{quote.price.toFixed(2)}
          </Text>
        )
      },
    },
    {
      title: '市值',
      key: 'marketValue',
      render: (_: unknown, record: Position) => {
        const quote = quotes[record.stockCode]
        const price = quote?.price || record.costPrice
        return `¥${(price * record.quantity).toFixed(2)}`
      },
    },
    {
      title: '盈亏',
      key: 'profit',
      render: (_: unknown, record: Position) => {
        const quote = quotes[record.stockCode]
        if (!quote) return <Text type="secondary">--</Text>
        const profit = (quote.price - record.costPrice) * record.quantity
        const profitRate = ((quote.price - record.costPrice) / record.costPrice) * 100
        const isProfit = profit >= 0
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ color: isProfit ? '#EF4444' : '#10B981' }}>
              {isProfit ? '+' : ''}{profit.toFixed(2)}
            </Text>
            <Tag color={isProfit ? 'red' : 'green'}>
              {isProfit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(profitRate).toFixed(2)}%
            </Tag>
          </Space>
        )
      },
    },
    {
      title: '目标/止损',
      key: 'targets',
      render: (_: unknown, record: Position) => (
        <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
          {record.targetPrice && <Text type="success">目标: ¥{record.targetPrice}</Text>}
          {record.stopPrice && <Text type="danger">止损: ¥{record.stopPrice}</Text>}
          {!record.targetPrice && !record.stopPrice && <Text type="secondary">--</Text>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Position) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" icon={<MinusOutlined />} onClick={() => handleReduce(record)} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>持仓管理</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchQuotes}>刷新行情</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加持仓</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="持仓数量" value={positions.length} suffix="只" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="总成本" value={summary.totalCost} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="总市值" value={summary.totalMarketValue} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="总盈亏"
              value={summary.totalProfit}
              precision={2}
              prefix={summary.totalProfit >= 0 ? '+¥' : '¥'}
              valueStyle={{ color: summary.totalProfit >= 0 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Spin spinning={loading}>
          {positions.length > 0 ? (
            <Table columns={columns} dataSource={positions} rowKey="id" pagination={false} />
          ) : (
            <Empty description="暂无持仓">
              <Button type="primary" onClick={handleAdd}>添加持仓</Button>
            </Empty>
          )}
        </Spin>
      </Card>

      <Modal
        title={editingPosition ? '编辑持仓' : '添加持仓'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如: 600000" disabled={!!editingPosition} />
          </Form.Item>
          <Form.Item name="stockName" label="股票名称" rules={[{ required: true }]}>
            <Input placeholder="如: 浦发银行" disabled={!!editingPosition} />
          </Form.Item>
          <Form.Item name="quantity" label="持仓数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="costPrice" label="成本价" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetPrice" label="目标价">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stopPrice" label="止损价">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="减仓"
        open={reduceModalVisible}
        onOk={handleReduceSubmit}
        onCancel={() => setReduceModalVisible(false)}
      >
        <Form form={reduceForm} layout="vertical">
          <Form.Item name="quantity" label="减仓数量" rules={[{ required: true }]}>
            <InputNumber min={1} max={editingPosition?.quantity} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PositionPage
