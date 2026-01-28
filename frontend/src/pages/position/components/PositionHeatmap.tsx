import React, { useState, useEffect } from 'react'
import { Card, Spin, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { positionService, stockService, type Position, type StockQuote } from '@/services'

const PositionHeatmap: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{ name: string; value: number; profit: number }[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const posRes = await positionService.getPositions()
      const positions = posRes.data.data || []
      if (positions.length === 0) {
        setData([])
        return
      }

      const codes = positions.map((p: Position) => p.stockCode)
      const quoteRes = await stockService.getQuotes(codes)
      const quotes: Record<string, StockQuote> = {}
      quoteRes.data.data?.forEach((q: StockQuote) => {
        quotes[q.code] = q
      })

      const items = positions.map((p: Position) => {
        const quote = quotes[p.stockCode]
        const currentPrice = quote?.price || p.costPrice
        const marketValue = currentPrice * p.quantity
        const profit = (currentPrice - p.costPrice) * p.quantity
        return {
          name: p.stockName,
          value: marketValue,
          profit,
        }
      })
      setData(items)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const getOption = () => ({
    tooltip: {
      formatter: (info: { name: string; value: number; data: { profit: number } }) => {
        const profit = info.data.profit
        return `${info.name}<br/>市值: ¥${info.value.toFixed(0)}<br/>盈亏: ¥${profit.toFixed(0)}`
      },
    },
    series: [{
      type: 'treemap',
      data: data.map((d) => ({
        name: d.name,
        value: d.value,
        profit: d.profit,
        itemStyle: {
          color: d.profit >= 0 ? `rgba(207,19,34,${Math.min(0.3 + Math.abs(d.profit) / 10000, 1)})`
            : `rgba(63,134,0,${Math.min(0.3 + Math.abs(d.profit) / 10000, 1)})`,
        },
      })),
      label: { show: true, formatter: '{b}' },
      breadcrumb: { show: false },
    }],
  })

  return (
    <Card title="持仓热力图">
      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Empty description="暂无持仓" />
        ) : (
          <ReactECharts option={getOption()} style={{ height: 400 }} />
        )}
      </Spin>
    </Card>
  )
}

export default PositionHeatmap
