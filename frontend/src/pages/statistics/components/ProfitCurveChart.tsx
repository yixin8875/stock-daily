import React, { useState, useMemo } from 'react'
import { Card, Spin, Radio, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { ProfitCurvePoint } from '@/types/statistics'

interface ProfitCurveChartProps {
  data: ProfitCurvePoint[]
  loading: boolean
}

type DisplayMode = 'amount' | 'rate'

const PROFIT_COLOR = '#F5222D'
const LOSS_COLOR = '#52C41A'

const ProfitCurveChart: React.FC<ProfitCurveChartProps> = ({ data, loading }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('amount')

  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    const xData = data.map((item) => item.date)
    const yData = data.map((item) =>
      displayMode === 'amount' ? item.profit : item.profitRate
    )

    const lastValue = yData[yData.length - 1] || 0
    const lineColor = lastValue >= 0 ? PROFIT_COLOR : LOSS_COLOR

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const point = params[0]
          const value = point.value
          const suffix = displayMode === 'amount' ? ' 元' : '%'
          return `${point.axisValue}<br/>累计收益: ${value.toFixed(2)}${suffix}`
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
        boundaryGap: false,
        data: xData,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) =>
            displayMode === 'amount' ? `${value}` : `${value}%`,
        },
      },
      series: [
        {
          name: '累计收益',
          type: 'line',
          smooth: true,
          data: yData,
          lineStyle: {
            color: lineColor,
            width: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: lineColor + '40' },
                { offset: 1, color: lineColor + '05' },
              ],
            },
          },
          itemStyle: {
            color: lineColor,
          },
        },
      ],
    }
  }, [data, displayMode])

  return (
    <Card
      title="收益曲线"
      extra={
        <Radio.Group
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value)}
          size="small"
        >
          <Radio.Button value="amount">金额</Radio.Button>
          <Radio.Button value="rate">百分比</Radio.Button>
        </Radio.Group>
      }
    >
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

export default ProfitCurveChart
