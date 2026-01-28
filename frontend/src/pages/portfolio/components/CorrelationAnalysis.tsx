import React, { useState, useEffect } from 'react'
import { Card, Spin, Empty } from 'antd'
import { HeatMapOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { portfolioService, type CorrelationData } from '@/services'

const CorrelationAnalysis: React.FC = () => {
  const [data, setData] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await portfolioService.getCorrelation()
      setData(res.data.data || null)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const getChartOption = () => {
    if (!data) return {}
    const { stocks, matrix } = data
    const heatmapData: [number, number, number][] = []

    matrix.forEach((row, i) => {
      row.forEach((val, j) => {
        heatmapData.push([j, i, Number(val.toFixed(2))])
      })
    })

    return {
      tooltip: {
        formatter: (params: { data: number[] }) => {
          const [x, y, val] = params.data
          return `${stocks[y]} vs ${stocks[x]}: ${val}`
        }
      },
      xAxis: { type: 'category', data: stocks, axisLabel: { rotate: 45 } },
      yAxis: { type: 'category', data: stocks },
      visualMap: {
        min: -1, max: 1, calculable: true,
        inRange: { color: ['#10B981', '#FFFFFF', '#EF4444'] },
        orient: 'horizontal', left: 'center', bottom: 0
      },
      series: [{
        type: 'heatmap', data: heatmapData,
        label: { show: true, fontSize: 10 }
      }]
    }
  }

  return (
    <Card title={<><HeatMapOutlined style={{ marginRight: 8 }} />持仓相关性分析</>}>
      <Spin spinning={loading}>
        {data && data.stocks.length > 0 ? (
          <ReactECharts option={getChartOption()} style={{ height: 400 }} />
        ) : (
          <Empty description="暂无持仓数据" />
        )}
      </Spin>
    </Card>
  )
}

export default CorrelationAnalysis
