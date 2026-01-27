import React, { useMemo } from 'react'
import { Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useThemeStore } from '@/stores'
import { getChartTheme, chartColors } from '@/utils/chartTheme'
import type { Trade } from '@/services'
import dayjs from 'dayjs'

interface TradeScatterChartProps {
  trades: Trade[]
}

const TradeScatterChart: React.FC<TradeScatterChartProps> = ({ trades }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!trades || trades.length === 0) return {}

    // 按日期排序
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.diary.date).getTime() - new Date(b.diary.date).getTime()
    )

    const xData = sortedTrades.map((t) => dayjs(t.diary.date).format('MM-DD'))
    const buyData: (number | null)[] = []
    const sellData: (number | null)[] = []

    sortedTrades.forEach((trade) => {
      const price = Number(trade.price)
      if (trade.direction === 'BUY') {
        buyData.push(price)
        sellData.push(null)
      } else {
        buyData.push(null)
        sellData.push(price)
      }
    })

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        formatter: (params: any) => {
          const idx = params[0]?.dataIndex
          if (idx === undefined) return ''
          const trade = sortedTrades[idx]
          const dirText = trade.direction === 'BUY' ? '买入' : '卖出'
          const color = trade.direction === 'BUY' ? chartColors.loss : chartColors.profit
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600; margin-bottom: 8px;">${dayjs(trade.diary.date).format('YYYY-MM-DD')}</div>
              <div style="color: ${color};">${dirText}: ¥${Number(trade.price).toFixed(2)}</div>
              <div>数量: ${trade.quantity} 股</div>
              ${trade.reason ? `<div style="margin-top: 4px; color: #888;">原因: ${trade.reason}</div>` : ''}
            </div>
          `
        },
      },
      legend: {
        ...chartTheme.legend,
        data: ['买入', '卖出'],
        top: 0,
      },
      xAxis: {
        ...chartTheme.xAxis,
        type: 'category',
        data: xData,
      },
      yAxis: {
        ...chartTheme.yAxis,
        type: 'value',
        axisLabel: {
          ...chartTheme.yAxis.axisLabel,
          formatter: (v: number) => `¥${v.toFixed(0)}`,
        },
      },
      series: [
        {
          name: '买入',
          type: 'scatter',
          symbolSize: 14,
          data: buyData,
          itemStyle: { color: chartColors.loss },
        },
        {
          name: '卖出',
          type: 'scatter',
          symbolSize: 14,
          data: sellData,
          itemStyle: { color: chartColors.profit },
        },
      ],
    }
  }, [trades, mode, chartTheme])

  if (!trades || trades.length === 0) {
    return <Empty description="暂无交易数据" style={{ padding: '20px 0' }} />
  }

  return <ReactECharts option={option} style={{ height: 250 }} />
}

export default TradeScatterChart
