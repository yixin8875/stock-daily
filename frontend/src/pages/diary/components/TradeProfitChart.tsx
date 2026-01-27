import React, { useMemo } from 'react'
import { Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useThemeStore } from '@/stores'
import { getChartTheme, chartColors, createGradient } from '@/utils/chartTheme'
import type { Trade } from '@/services'
import dayjs from 'dayjs'

interface TradeProfitChartProps {
  trades: Trade[]
  avgBuyPrice: number
}

const TradeProfitChart: React.FC<TradeProfitChartProps> = ({ trades, avgBuyPrice }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!trades || trades.length === 0) return {}

    // 按日期排序
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.diary.date).getTime() - new Date(b.diary.date).getTime()
    )

    // 计算累计盈亏
    let cumulativeProfit = 0
    const profitData: { date: string; profit: number; trade: Trade }[] = []

    sortedTrades.forEach((trade) => {
      const price = Number(trade.price)
      if (trade.direction === 'SELL') {
        // 卖出时计算盈亏
        const profit = (price - avgBuyPrice) * trade.quantity
        cumulativeProfit += profit
      }
      profitData.push({
        date: dayjs(trade.diary.date).format('MM-DD'),
        profit: cumulativeProfit,
        trade,
      })
    })

    const xData = profitData.map((d) => d.date)
    const yData = profitData.map((d) => d.profit)
    const lastValue = yData[yData.length - 1] || 0
    const lineColor = lastValue >= 0 ? chartColors.profit : chartColors.loss

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        formatter: (params: any) => {
          const point = params[0]
          const data = profitData[point.dataIndex]
          const prefix = data.profit >= 0 ? '+' : ''
          const directionText = data.trade.direction === 'BUY' ? '买入' : '卖出'
          const directionColor = data.trade.direction === 'BUY' ? chartColors.loss : chartColors.profit
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600; margin-bottom: 8px;">${data.date}</div>
              <div style="margin-bottom: 4px;">
                <span style="color: ${directionColor};">${directionText}</span>
                <span style="margin-left: 8px;">¥${Number(data.trade.price).toFixed(2)} × ${data.trade.quantity}</span>
              </div>
              <div>累计盈亏: <span style="color: ${lineColor}; font-weight: 600;">${prefix}${data.profit.toFixed(2)}</span></div>
            </div>
          `
        },
      },
      xAxis: {
        ...chartTheme.xAxis,
        type: 'category',
        boundaryGap: false,
        data: xData,
      },
      yAxis: {
        ...chartTheme.yAxis,
        type: 'value',
        axisLabel: {
          ...chartTheme.yAxis.axisLabel,
          formatter: (value: number) => `${value >= 0 ? '+' : ''}${value}`,
        },
      },
      series: [
        {
          name: '累计盈亏',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          data: yData,
          lineStyle: { color: lineColor, width: 2 },
          areaStyle: { color: createGradient(lineColor) },
          itemStyle: {
            color: lineColor,
            borderWidth: 2,
            borderColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          },
        },
      ],
    }
  }, [trades, avgBuyPrice, mode, chartTheme])

  if (!trades || trades.length === 0) {
    return <Empty description="暂无交易数据" style={{ padding: '20px 0' }} />
  }

  return <ReactECharts option={option} style={{ height: 250 }} />
}

export default TradeProfitChart
