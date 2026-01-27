import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Card, Table, Button, Space, Typography, Tag, message, Modal, Form, Input,
  InputNumber, Popconfirm, Empty, Spin, Row, Col, Statistic, Tooltip, Select
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined,
  ArrowUpOutlined, ArrowDownOutlined, StarFilled, FilterOutlined
} from '@ant-design/icons'
import { watchlistService, stockService, type WatchlistStock, type StockQuote } from '@/services'

const { Title, Text } = Typography

const WatchlistPage: React.FC = () => {
  const [stocks, setStocks] = useState<WatchlistStock[]>([])
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingStock, setEditingStock] = useState<WatchlistStock | null>(null)
  const [form] = Form.useForm()
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null)

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

  // 计算统计数据
  const stats = useMemo(() => {
    let upCount = 0, downCount = 0, flatCount = 0
    stocks.forEach(s => {
      const quote = quotes[s.stockCode]
      if (quote) {
        if (quote.change > 0) upCount++
        else if (quote.change < 0) downCount++
        else flatCount++
      }
    })
    return { upCount, downCount, flatCount, total: stocks.length }
  }, [stocks, quotes])

  // 获取所有行业
  const industries = useMemo(() => {
    const set = new Set<string>()
    stocks.forEach(s => { if (s.industry) set.add(s.industry) })
    return Array.from(set)
  }, [stocks])

  // 筛选后的数据
  const filteredStocks = useMemo(() => {
    if (!filterIndustry) return stocks
    return stocks.filter(s => s.industry === filterIndustry)
  }, [stocks, filterIndustry])

  const columns = [
    {
      title: '股票',
      key: 'stock',
      width: 140,
      render: (_: unknown, record: WatchlistStock) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </Space>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 90,
      render: (v: string | null) => v ? <Tag>{v}</Tag> : <Text type="secondary">--</Text>,
    },
    {
      title: '现价',
      key: 'price',
      width: 120,
      render: (_: unknown, record: WatchlistStock) => {
        const quote = quotes[record.stockCode]
        if (!quote) return <Text type="secondary">--</Text>
        const change = quote.change || 0
        const color = change >= 0 ? '#cf1322' : '#3f8600'
        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ color }}>¥{quote.price.toFixed(2)}</Text>
            <Text style={{ color, fontSize: 12 }}>
              {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </Text>
          </Space>
        )
      },
    },
    {
      title: '添加价',
      dataIndex: 'addPrice',
      key: 'addPrice',
      width: 90,
      render: (v: number | null) => v ? `¥${v.toFixed(2)}` : '--',
    },
    {
      title: '涨跌(自添加)',
      key: 'changeFromAdd',
      width: 110,
      render: (_: unknown, record: WatchlistStock) => {
        const quote = quotes[record.stockCode]
        if (!quote || !record.addPrice) return <Text type="secondary">--</Text>
        const change = ((quote.price - record.addPrice) / record.addPrice) * 100
        const color = change >= 0 ? '#cf1322' : '#3f8600'
        return (
          <Text style={{ color }}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </Text>
        )
      },
    },
    {
      title: '目标价',
      key: 'targetPrice',
      width: 100,
      render: (_: unknown, record: WatchlistStock) => {
        if (!record.targetPrice) return <Text type="secondary">--</Text>
        const quote = quotes[record.stockCode]
        const reached = quote && quote.price >= record.targetPrice
        return (
          <Tooltip title={reached ? '已达目标价!' : ''}>
            <Text type={reached ? 'success' : undefined}>
              ¥{record.targetPrice.toFixed(2)} {reached && '✓'}
            </Text>
          </Tooltip>
        )
      },
    },
    {
      title: '止损价',
      key: 'stopPrice',
      width: 100,
      render: (_: unknown, record: WatchlistStock) => {
        if (!record.stopPrice) return <Text type="secondary">--</Text>
        const quote = quotes[record.stockCode]
        const triggered = quote && quote.price <= record.stopPrice
        return (
          <Tooltip title={triggered ? '已触发止损!' : ''}>
            <Text type={triggered ? 'danger' : undefined}>
              ¥{record.stopPrice.toFixed(2)} {triggered && '!'}
            </Text>
          </Tooltip>
        )
      },
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
        <Title level={3} style={{ margin: 0 }}>
          <StarFilled style={{ marginRight: 8, color: '#faad14' }} />
          自选股
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchQuotes}>刷新行情</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加股票</Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="自选总数" value={stats.total} suffix="只" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="上涨" value={stats.upCount} valueStyle={{ color: '#cf1322' }} suffix="只" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="下跌" value={stats.downCount} valueStyle={{ color: '#3f8600' }} suffix="只" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="平盘" value={stats.flatCount} suffix="只" />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>筛选</span>
            <Select
              allowClear
              placeholder="按行业筛选"
              style={{ width: 150 }}
              value={filterIndustry}
              onChange={setFilterIndustry}
              options={industries.map(i => ({ label: i, value: i }))}
            />
          </Space>
        }
      >
        <Spin spinning={loading}>
          {filteredStocks.length > 0 ? (
            <Table columns={columns} dataSource={filteredStocks} rowKey="id" pagination={false} scroll={{ x: 900 }} />
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
