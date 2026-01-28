import React, { useState, useEffect } from 'react'
import { Card, Input, Button, Table, Space, Spin, Empty } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { stockService, type StockQuote } from '@/services'

const STORAGE_KEY = 'stock_compare_codes'

const StockCompare: React.FC = () => {
  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')

  // 从 localStorage 加载保存的股票代码并获取行情
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const codes = JSON.parse(saved) as string[]
        if (codes.length > 0) {
          setLoading(true)
          stockService.getQuotes(codes).then(res => {
            if (res.data.data) setStocks(res.data.data)
          }).finally(() => setLoading(false))
        }
      } catch (e) {
        console.error('Failed to load compare stocks:', e)
      }
    }
  }, [])

  const handleAdd = async () => {
    if (!code.trim() || stocks.find(s => s.code === code)) return
    setLoading(true)
    try {
      const res = await stockService.getQuote(code.trim())
      if (res.data.data) {
        const newStocks = [...stocks, res.data.data]
        setStocks(newStocks)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStocks.map(s => s.code)))
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false)
      setCode('')
    }
  }

  const handleRemove = (c: string) => {
    const newStocks = stocks.filter(s => s.code !== c)
    setStocks(newStocks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStocks.map(s => s.code)))
  }

  const columns = [
    { title: '代码', dataIndex: 'code', key: 'code', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    { title: '价格', dataIndex: 'price', key: 'price',
      render: (v: number) => v.toFixed(2) },
    { title: '涨跌幅', dataIndex: 'changePercent', key: 'changePercent',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#cf1322' : '#3f8600' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}%
        </span>
      )},
    { title: '成交量', dataIndex: 'volume', key: 'volume',
      render: (v: number) => `${(v / 10000).toFixed(0)}万` },
    { title: '操作', key: 'action',
      render: (_: unknown, r: StockQuote) => (
        <Button type="link" danger icon={<DeleteOutlined />}
          onClick={() => handleRemove(r.code)} />
      )},
  ]

  return (
    <Card title="股票对比分析">
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="股票代码" value={code}
          onChange={e => setCode(e.target.value)}
          onPressEnter={handleAdd} style={{ width: 120 }} />
        <Button type="primary" icon={<PlusOutlined />}
          onClick={handleAdd} loading={loading}>添加</Button>
      </Space>
      <Spin spinning={loading}>
        {stocks.length === 0 ? (
          <Empty description="请添加股票进行对比" />
        ) : (
          <Table columns={columns} dataSource={stocks}
            rowKey="code" size="small" pagination={false} />
        )}
      </Spin>
    </Card>
  )
}

export default StockCompare
