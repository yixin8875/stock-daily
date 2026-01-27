import React, { useMemo } from 'react'
import { Card, Spin, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { EmotionProfitData } from '@/types/statistics'

interface EmotionProfitChartProps {
  data: EmotionProfitData[]
  loading: boolean
}

const EMOTION_COLORS: Record<string, string> = {
  EXCITED: '#F5222D',
  CALM: '#52C41A',
  ANXIOUS: '#FAAD14',
  FEARFUL: '#722ED1',
  GREEDY: '#EB2F96',
}

const EmotionProfitChart: React.FC<EmotionProfitChartProps> = ({ data, loading }) => {
  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    const sortedData = [...data].sort((a, b) => b.winRate - a.winRate)

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const idx = params[0].dataIndex
          const item = sortedData[idx]
          return `<b>${item.emotionLabel}</b><br/>
            胜率: ${item.winRate.toFixed(1)}%<br/>
            平均收益: ${item.avgProfit.toFixed(2)}元<br/>
            总收益: ${item.totalProfit.toFixed(2)}元<br/>
            交易天数: ${item.totalDays}天<br/>
            盈利: ${item.winningDays}天 / 亏损: ${item.losingDays}天`
        },
      },
      legend: {
        data: ['胜率', '平均收益'],
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedData.map((item) => item.emotionLabel),
      },
      yAxis: [
        {
          type: 'value',
          name: '胜率(%)',
          min: 0,
          max: 100,
          axisLabel: { formatter: '{value}%' },
        },
        {
          type: 'value',
          name: '平均收益(元)',
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '胜率',
          type: 'bar',
          data: sortedData.map((item) => ({
            value: item.winRate,
            itemStyle: { color: EMOTION_COLORS[item.emotion] || '#1890FF' },
          })),
          barWidth: '40%',
        },
        {
          name: '平均收益',
          type: 'line',
          yAxisIndex: 1,
          data: sortedData.map((item) => item.avgProfit),
          lineStyle: { width: 2, color: '#722ED1' },
          itemStyle: { color: '#722ED1' },
          symbol: 'circle',
          symbolSize: 8,
        },
      ],
    }
  }, [data])

  return (
    <Card title="情绪与收益分析">
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

export default EmotionProfitChart
