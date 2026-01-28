import React, { useMemo } from 'react'
import { Card, Spin, Empty, Space, Select } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { HeatmapData } from '@/types/statistics'
import { useThemeStore } from '@/stores'
import { getChartTheme } from '@/utils/chartTheme'

interface TradeHeatmapProps {
  data: HeatmapData[]
  year: number
  loading: boolean
  onYearChange?: (year: number) => void
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}年`
}))

const TradeHeatmap: React.FC<TradeHeatmapProps> = ({
  data, year, loading, onYearChange
}) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    // 转换为ECharts日历热力图格式
    const heatmapData = data.map(item => [item.date, item.profit])

    return {
      ...chartTheme,
      tooltip: {
        formatter: (params: any) => {
          const d = data.find(item => item.date === params.data[0])
          if (!d) return ''
          const color = d.profit >= 0 ? '#EF4444' : '#10B981'
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600;">${d.date}</div>
              <div style="color: ${color}; margin-top: 4px;">
                盈亏: ${d.profit >= 0 ? '+' : ''}${d.profit.toFixed(2)}
              </div>
              <div style="color: #999;">交易: ${d.tradeCount}笔</div>
            </div>
          `
        }
      },
      visualMap: {
        min: -1000,
        max: 1000,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        inRange: {
          color: ['#10B981', '#E5E7EB', '#EF4444']
        },
        textStyle: { color: mode === 'dark' ? '#94A3B8' : '#64748B' }
      },
      calendar: {
        top: 60,
        left: 30,
        right: 30,
        cellSize: ['auto', 15],
        range: year,
        itemStyle: {
          borderWidth: 2,
          borderColor: mode === 'dark' ? '#1E293B' : '#fff'
        },
        yearLabel: { show: false },
        dayLabel: {
          color: mode === 'dark' ? '#94A3B8' : '#64748B',
          nameMap: ['日', '一', '二', '三', '四', '五', '六']
        },
        monthLabel: {
          color: mode === 'dark' ? '#94A3B8' : '#64748B'
        },
        splitLine: { show: false }
      },
      series: [{
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: heatmapData
      }]
    }
  }, [data, year, mode, chartTheme])

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined style={{ color: '#722ED1' }} />
          <span>交易热力图</span>
        </Space>
      }
      extra={
        <Select
          value={year}
          onChange={onYearChange}
          options={yearOptions}
          style={{ width: 100 }}
          size="small"
        />
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin /></div>
      ) : data.length === 0 ? (
        <Empty description="暂无数据" />
      ) : (
        <ReactECharts option={option} style={{ height: 200 }} />
      )}
    </Card>
  )
}

export default TradeHeatmap
