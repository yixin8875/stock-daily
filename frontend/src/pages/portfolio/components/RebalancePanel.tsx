import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, InputNumber, Space, Spin, Empty } from 'antd'
import { SyncOutlined } from '@ant-design/icons'
import { portfolioService, type RebalanceItem } from '@/services'

const RebalancePanel: React.FC = () => {
  const [data, setData] = useState<RebalanceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [threshold, setThreshold] = useState(5)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await portfolioService.getRebalanceAdvice({})
      setData(res.data.data || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const needsRebalance = data.filter(d => Math.abs(d.deviation) >= threshold)

  const columns = [
    {
      title: '股票', key: 'stock',
      render: (_: unknown, r: RebalanceItem) => <><div>{r.stockName}</div><div style={{ fontSize: 12, color: '#999' }}>{r.stockCode}</div></>
    },
    { title: '当前占比', dataIndex: 'currentWeight', key: 'current', render: (v: number) => `${v.toFixed(1)}%` },
    { title: '目标占比', dataIndex: 'targetWeight', key: 'target', render: (v: number) => `${v.toFixed(1)}%` },
    {
      title: '偏离度', dataIndex: 'deviation', key: 'deviation',
      render: (v: number) => <Tag color={Math.abs(v) >= threshold ? 'red' : 'default'}>{v > 0 ? '+' : ''}{v.toFixed(1)}%</Tag>
    },
    {
      title: '建议操作', dataIndex: 'action', key: 'action',
      render: (v: string) => <Tag color={v === 'buy' ? 'green' : v === 'sell' ? 'red' : 'default'}>{v === 'buy' ? '买入' : v === 'sell' ? '卖出' : '持有'}</Tag>
    },
    { title: '建议金额', dataIndex: 'suggestedAmount', key: 'amount', render: (v: number) => `¥${Math.abs(v).toFixed(0)}` },
  ]

  return (
    <Card
      title={<><SyncOutlined style={{ marginRight: 8 }} />再平衡提醒</>}
      extra={<Space><span>偏离阈值:</span><InputNumber min={1} max={20} value={threshold} onChange={v => setThreshold(v || 5)} addonAfter="%" size="small" style={{ width: 100 }} /></Space>}
    >
      <Spin spinning={loading}>
        {needsRebalance.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, background: '#FFF7E6', borderRadius: 4 }}>
            <strong>需要再平衡:</strong> {needsRebalance.length} 只股票偏离超过 {threshold}%
          </div>
        )}
        {data.length > 0 ? (
          <Table columns={columns} dataSource={data} rowKey="stockCode" pagination={false} size="small" />
        ) : (
          <Empty description="暂无持仓数据" />
        )}
      </Spin>
    </Card>
  )
}

export default RebalancePanel
