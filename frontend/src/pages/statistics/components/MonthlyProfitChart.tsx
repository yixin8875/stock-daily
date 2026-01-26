import React, { useMemo } from 'react'
import { Card, Spin, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { MonthlyProfit } from '@/types/statistics'

interface MonthlyProfitChartProps {
  data: MonthlyProfit[]
  loading: boolean
}

const PROFIT_COLOR = '#F5222D'
const LOSS_COLOR = '#52C41A'

const MonthlyProfitChart: React.FC<MonthlyProfitChartProps> = ({ data, loading }) => {
  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const point = params[0]
          const value = point.value
          const rate = data[point.dataIndex]?.profitRate ?? 0
          return `${point.axisValue}<br/>收益: ${value.toFixed(2)} 元<br/>收益率: ${rate.toFixed(2)}%`
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
        data: data.map((item) => item.month),
        axisLabel: { rotate: 30 },
      },
      yAxis: {
        type: 'value',
        name: '收益(元)',
      },
      series: [
        {
          name: '月度收益',
          type: 'bar',
          data: data.map((item) => ({
            value: item.profit,
            itemStyle: {
              color: item.profit >= 0 ? PROFIT_COLOR : LOSS_COLOR,
            },
          })),
          barWidth: '60%',
        },
      ],
    }
  }, [data])

  return (
    <Card title="月度收益">
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

export default MonthlyProfitChart
