import React, { useMemo } from 'react'
import { Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useThemeStore } from '@/stores'
import { getChartTheme, chartColors } from '@/utils/chartTheme'

interface PositionData {
  stockCode: string
  stockName: string
  cost: number
  percentage: number
  quantity: number
}

interface PositionBarChartProps {
  data: PositionData[]
}

const PositionBarChart: React.FC<PositionBarChartProps> = ({ data }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    const sortedData = [...data].slice(0, 10)

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = sortedData[params[0].dataIndex]
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600;">${item.stockName}</div>
              <div>代码: ${item.stockCode}</div>
              <div>金额: ¥${item.cost.toLocaleString()}</div>
              <div>占比: ${item.percentage.toFixed(1)}%</div>
            </div>
          `
        },
      },
      xAxis: {
        ...chartTheme.xAxis,
        type: 'category',
        data: sortedData.map(d => d.stockName),
        axisLabel: { ...chartTheme.xAxis.axisLabel, rotate: 30 },
      },
      yAxis: {
        ...chartTheme.yAxis,
        type: 'value',
        axisLabel: {
          ...chartTheme.yAxis.axisLabel,
          formatter: (v: number) => `${v.toFixed(0)}%`,
        },
      },
      series: [{
        type: 'bar',
        data: sortedData.map((d, i) => ({
          value: d.percentage,
          itemStyle: { color: chartColors.series[i % chartColors.series.length] },
        })),
        barWidth: '60%',
      }],
    }
  }, [data, mode, chartTheme])

  if (!data || data.length === 0) {
    return <Empty description="暂无数据" style={{ padding: '40px 0' }} />
  }

  return <ReactECharts option={option} style={{ height: 280 }} />
}

export default PositionBarChart
