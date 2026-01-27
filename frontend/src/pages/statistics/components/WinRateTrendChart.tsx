import React, { useMemo } from 'react'
import { Card, Spin, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { WinRateTrendPoint } from '@/types/statistics'

interface WinRateTrendChartProps {
  data: WinRateTrendPoint[]
  loading: boolean
}

const WinRateTrendChart: React.FC<WinRateTrendChartProps> = ({ data, loading }) => {
  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const point = params[0]
          const item = data[point.dataIndex]
          return `${point.axisValue}<br/>胜率: ${item.winRate.toFixed(1)}%<br/>盈利: ${item.winningTrades}次<br/>总交易: ${item.totalTrades}次`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.date),
        axisLabel: { rotate: 30 },
      },
      yAxis: {
        type: 'value',
        name: '胜率(%)',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
      series: [
        {
          name: '胜率',
          type: 'line',
          data: data.map((item) => item.winRate),
          smooth: true,
          lineStyle: { width: 3 },
          itemStyle: { color: '#1890FF' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
              ],
            },
          },
          markLine: {
            silent: true,
            data: [{ yAxis: 50, lineStyle: { color: '#999', type: 'dashed' } }],
            label: { formatter: '50%' },
          },
        },
      ],
    }
  }, [data])

  return (
    <Card title="胜率趋势">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <Empty description="暂无数据" />
      ) : (
        <ReactECharts option={option} style={{ height: 350 }} />
      )}
    </Card>
  )
}

export default WinRateTrendChart
