import React, { useMemo } from 'react'
import { Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useThemeStore } from '@/stores'
import { getChartTheme, chartColors } from '@/utils/chartTheme'
import type { Trade } from '@/services'
import dayjs from 'dayjs'

interface TradeVolumeChartProps {
  trades: Trade[]
}

const TradeVolumeChart: React.FC<TradeVolumeChartProps> = ({ trades }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!trades || trades.length === 0) return {}

    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.diary.date).getTime() - new Date(b.diary.date).getTime()
    )

    const xData = sortedTrades.map((t) => dayjs(t.diary.date).format('MM-DD'))
    const volumeData = sortedTrades.map((trade) => ({
      value: trade.quantity,
      itemStyle: {
        color: trade.direction === 'BUY' ? chartColors.loss : chartColors.profit,
      },
    }))

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        formatter: (params: any) => {
          const idx = params[0]?.dataIndex
          if (idx === undefined) return ''
          const trade = sortedTrades[idx]
          const dir = trade.direction === 'BUY' ? '买入' : '卖出'
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600;">${dayjs(trade.diary.date).format('YYYY-MM-DD')}</div>
              <div>${dir}: ${trade.quantity} 股</div>
              <div>金额: ¥${(Number(trade.price) * trade.quantity).toLocaleString()}</div>
            </div>
          `
        },
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
          formatter: (v: number) => v.toLocaleString(),
        },
      },
      series: [
        {
          name: '交易量',
          type: 'bar',
          data: volumeData,
          barWidth: '60%',
        },
      ],
    }
  }, [trades, mode, chartTheme])

  if (!trades || trades.length === 0) {
    return <Empty description="暂无交易数据" style={{ padding: '20px 0' }} />
  }

  return <ReactECharts option={option} style={{ height: 200 }} />
}

export default TradeVolumeChart
