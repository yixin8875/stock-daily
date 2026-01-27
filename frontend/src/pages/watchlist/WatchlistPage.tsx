import React, { useEffect, useState, useCallback } from 'react'
import {
  Card, Table, Button, Space, Typography, Tag, message, Modal, Form, Input,
  InputNumber, Popconfirm, Empty, Spin
} from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons'
import { watchlistService, stockService, type WatchlistStock, type StockQuote } from '@/services'

const { Title, Text } = Typography

const WatchlistPage: React.FC = () => {
  const [stocks, setStocks] = useState<WatchlistStock[]>([])
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStock, setEditingStock] = useState<WatchlistStock | null>(null)
  const [form] = Form.useForm()

  const fetchStocks = async () => {
    setLoading(true)
    try {
      const res = await watchlistService.getWatchlist()
      setStocks(res.data.data || [])
    } catch (error) {
      message.error('获取自选股失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotes = useCallback(async () => {
    if (stocks.length === 0) return
    try {
      const codes = stocks.map(s => s.stockCode)
      const res = await stockService.getQuotes(codes)
      const quotesMap: Record<string, StockQuote> = {}
      res.data.data?.forEach((q: StockQuote) => { quotesMap[q.code] = q })
      setQuotes(quotesMap)
    } catch (error) {
      console.error('获取行情失败:', error)
    }
  }, [stocks])

  useEffect(() => { fetchStocks() }, [])
  useEffect(() => {
    fetchQuotes()
    const interval = setInterval(fetchQuotes, 10000)
    return () => clearInterval(interval)
  }, [fetchQuotes])

  const handleAdd = () => {
    setEditingStock(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (stock: WatchlistStock) => {
    setEditingStock(stock)
    form.setFieldsValue(stock)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingStock) {
        await watchlistService.updateStock(editingStock.id, values)
        message.success('更新成功')
      } else {
        await watchlistService.addStock(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      fetchStocks()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await watchlistService.removeStock(id)
      message.success('删除成功')
      fetchStocks()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: unknown, record: WatchlistStock) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </Space>
      ),
    },
    {
      title: '现价',
      key: 'price',
      render: (_: unknown, record: WatchlistStock) => {
        const quote = quotes[record.stockCode]
        if (!quote) return <Text type="secondary">--</Text>
        const change = quote.change || 0
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ color: change >= 0 ? '#EF4444' : '#10B981' }}>
              ¥{quote.price.toFixed(2)}
            </Text>
            <Tag color={change >= 0 ? 'red' : 'green'}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </Tag>
          </Space>
        )
      },
    },
    {
      title: '添加价',
      dataIndex: 'addPrice',
      key: 'addPrice',
      render: (v: number | null) => v ? `¥${v.toFixed(2)}` : '--',
    },
    {
      title: '涨跌幅(自添加)',
      key: 'changeFromAdd',
      render: (_: unknown, record: WatchlistStock) => {
        const quote = quotes[record.stockCode]
        if (!quote || !record.addPrice) return <Text type="secondary">--</Text>
        const change = ((quote.price - record.addPrice) / record.addPrice) * 100
        return (
          <Text style={{ color: change >= 0 ? '#EF4444' : '#10B981' }}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </Text>
        )
      },
    },
    {
      title: '目标/止损',
      key: 'targets',
      render: (_: unknown, record: WatchlistStock) => (
        <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
          {record.targetPrice && <Text type="success">目标: ¥{record.targetPrice}</Text>}
          {record.stopPrice && <Text type="danger">止损: ¥{record.stopPrice}</Text>}
          {!record.targetPrice && !record.stopPrice && <Text type="secondary">--</Text>}
        </Space>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      render: (v: string | null) => v || <Text type="secondary">--</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: WatchlistStock) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
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
        <Title level={3} style={{ margin: 0 }}>自选股</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchQuotes}>刷新行情</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加股票</Button>
        </Space>
      </div>

      <Card>
        <Spin spinning={loading}>
          {stocks.length > 0 ? (
            <Table columns={columns} dataSource={stocks} rowKey="id" pagination={false} />
          ) : (
            <Empty description="暂无自选股">
              <Button type="primary" onClick={handleAdd}>添加股票</Button>
            </Empty>
          )}
        </Spin>
      </Card>

      <Modal
        title={editingStock ? '编辑股票' : '添加股票'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如: 600000" disabled={!!editingStock} />
          </Form.Item>
          <Form.Item name="stockName" label="股票名称" rules={[{ required: true }]}>
            <Input placeholder="如: 浦发银行" disabled={!!editingStock} />
          </Form.Item>
          <Form.Item name="industry" label="行业板块">
            <Input placeholder="如: 银行" />
          </Form.Item>
          <Form.Item name="addPrice" label="添加价格">
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
    </div>
  )
}

export default WatchlistPage
