import React, { useState, useMemo } from 'react'
import { Card, Spin, Empty, Space, Select } from 'antd'
import { StockOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { IndexComparePoint } from '@/types/statistics'
import { useThemeStore } from '@/stores'
import { chartColors } from '@/utils/chartTheme'

interface IndexCompareChartProps {
  data: IndexComparePoint[]
  indexName: string
  loading: boolean
  onIndexChange?: (code: string) => void
}

const indexOptions = [
  { value: '000300', label: '沪深300' },
  { value: '000001', label: '上证指数' },
  { value: '399001', label: '深证成指' },
  { value: '399006', label: '创业板指' },
]

const IndexCompareChart: React.FC<IndexCompareChartProps> = ({
  data, indexName, loading, onIndexChange
}) => {
  const [selectedIndex, setSelectedIndex] = useState('000300')
  const { mode } = useThemeStore()

  const handleIndexChange = (value: string) => {
    setSelectedIndex(value)
    onIndexChange?.(value)
  }

  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    const xData = data.map(item => item.date)
    const myData = data.map(item => item.profitRate)
    const indexData = data.map(item => item.indexRate)
    const textColor = mode === 'dark' ? '#94A3B8' : '#64748B'

    return {
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['我的收益', indexName],
        top: 10,
        textStyle: { color: textColor }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xData,
        axisLabel: { color: textColor }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: textColor,
          formatter: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
        }
      },
      series: [
        {
          name: '我的收益',
          type: 'line',
          smooth: true,
          data: myData,
          lineStyle: { color: chartColors.profit, width: 2 },
          itemStyle: { color: chartColors.profit },
        },
        {
          name: indexName,
          type: 'line',
          smooth: true,
          data: indexData,
          lineStyle: { color: '#1890FF', width: 2 },
          itemStyle: { color: '#1890FF' },
        },
      ],
    }
  }, [data, indexName, mode])

  return (
    <Card
      title={
        <Space>
          <StockOutlined style={{ color: '#1890FF' }} />
          <span>收益对比</span>
        </Space>
      }
      extra={
        <Select
          value={selectedIndex}
          onChange={handleIndexChange}
          options={indexOptions}
          style={{ width: 120 }}
          size="small"
        />
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin /></div>
      ) : data.length === 0 ? (
        <Empty description="暂无数据" />
      ) : (
        <ReactECharts option={option} style={{ height: 300 }} />
      )}
    </Card>
  )
}

export default IndexCompareChart
