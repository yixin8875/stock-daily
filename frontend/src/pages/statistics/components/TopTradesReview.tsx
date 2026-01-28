import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Tabs, Spin, Empty } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import { statisticsService } from '@/services'
import type { TopTrade, StatisticsPeriod } from '@/types/statistics'

interface Props {
  period: StatisticsPeriod
}

const TopTradesReview: React.FC<Props> = ({ period }) => {
  const [bestTrades, setBestTrades] = useState<TopTrade[]>([])
  const [worstTrades, setWorstTrades] = useState<TopTrade[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await statisticsService.getTopTrades(period, 5)
      setBestTrades(res.data.data?.bestTrades || [])
      setWorstTrades(res.data.data?.worstTrades || [])
    } catch {
      setBestTrades([])
      setWorstTrades([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '股票', key: 'stock',
      render: (_: unknown, r: TopTrade) => (
        <><div>{r.stockName}</div><div style={{ fontSize: 12, color: '#999' }}>{r.stockCode}</div></>
      )
    },
    { title: '买入日期', dataIndex: 'buyDate', key: 'buyDate' },
    { title: '卖出日期', dataIndex: 'sellDate', key: 'sellDate' },
    { title: '持有天数', dataIndex: 'holdingDays', key: 'days', render: (v: number) => `${v}天` },
    {
      title: '收益', dataIndex: 'profit', key: 'profit',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#52C41A' : '#EF4444' }}>
          {v >= 0 ? '+' : ''}¥{v.toFixed(0)}
        </span>
      )
    },
    {
      title: '收益率', dataIndex: 'profitRate', key: 'rate',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'green' : 'red'}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</Tag>
      )
    },
  ]

  const items = [
    {
      key: 'best',
      label: <span style={{ color: '#52C41A' }}>最佳交易</span>,
      children: bestTrades.length > 0 ? (
        <Table columns={columns} dataSource={bestTrades} rowKey="id" pagination={false} size="small" />
      ) : <Empty description="暂无数据" />
    },
    {
      key: 'worst',
      label: <span style={{ color: '#EF4444' }}>最差交易</span>,
      children: worstTrades.length > 0 ? (
        <Table columns={columns} dataSource={worstTrades} rowKey="id" pagination={false} size="small" />
      ) : <Empty description="暂无数据" />
    },
  ]

  return (
    <Card title={<><TrophyOutlined style={{ marginRight: 8 }} />交易回顾</>}>
      <Spin spinning={loading}>
        <Tabs items={items} />
      </Spin>
    </Card>
  )
}

export default TopTradesReview
