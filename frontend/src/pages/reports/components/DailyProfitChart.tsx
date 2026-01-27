import React, { useMemo } from 'react'
import { Card, Space, Empty } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useThemeStore } from '@/stores'
import { getChartTheme, getProfitLossColor, createGradient } from '@/utils/chartTheme'

interface DailyProfitChartProps {
  dailyProfits: { date: string; profit: number }[]
  periodLabel: string
}

const DailyProfitChart: React.FC<DailyProfitChartProps> = ({ dailyProfits, periodLabel }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!dailyProfits || dailyProfits.length === 0) return null

    const xData = dailyProfits.map((item) => item.date.slice(5)) // MM-DD format
    const yData = dailyProfits.map((item) => item.profit)
    const cumulativeData = yData.reduce((acc: number[], val, i) => {
      acc.push(i === 0 ? val : acc[i - 1] + val)
      return acc
    }, [])

    const lastCumulative = cumulativeData[cumulativeData.length - 1] || 0
    const lineColor = getProfitLossColor(lastCumulative, mode)

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        formatter: (params: any) => {
          const daily = params[0]
          const cumulative = params[1]
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600; margin-bottom: 8px;">${dailyProfits[daily.dataIndex].date}</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${daily.color};"></span>
                <span>当日收益</span>
                <span style="font-weight: 600; margin-left: auto;">${daily.value >= 0 ? '+' : ''}${daily.value.toFixed(2)} 元</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${cumulative.color};"></span>
                <span>累计收益</span>
                <span style="font-weight: 600; margin-left: auto;">${cumulative.value >= 0 ? '+' : ''}${cumulative.value.toFixed(2)} 元</span>
              </div>
            </div>
          `
        },
      },
      legend: {
        data: ['当日收益', '累计收益'],
        top: 0,
        textStyle: {
          color: mode === 'dark' ? '#94A3B8' : '#64748B',
        },
      },
      xAxis: {
        ...chartTheme.xAxis,
        type: 'category',
        data: xData,
        axisLabel: {
          ...chartTheme.xAxis.axisLabel,
          rotate: 45,
          fontSize: 11,
        },
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
          name: '当日收益',
          type: 'bar',
          data: yData.map((val) => ({
            value: val,
            itemStyle: {
              color: val >= 0 ? '#10B981' : '#EF4444',
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: '60%',
        },
        {
          name: '累计收益',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          data: cumulativeData,
          lineStyle: {
            color: lineColor,
            width: 2,
          },
          areaStyle: {
            color: createGradient(lineColor),
          },
          itemStyle: {
            color: lineColor,
          },
        },
      ],
    }
  }, [dailyProfits, mode, chartTheme])

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LineChartOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>{periodLabel}收益走势</span>
        </Space>
      }
    >
      {option ? (
        <ReactECharts option={option} style={{ height: 350 }} />
      ) : (
        <Empty description="暂无数据" style={{ padding: '60px 0' }} />
      )}
    </Card>
  )
}

export default DailyProfitChart
