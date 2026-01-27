import React, { useMemo } from 'react'
import { Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useThemeStore } from '@/stores'
import { getChartTheme, chartColors } from '@/utils/chartTheme'

interface IndustryData {
  name: string
  count: number
  cost: number
  percentage: number
}

interface IndustryPieChartProps {
  data: IndustryData[]
}

const IndustryPieChart: React.FC<IndustryPieChartProps> = ({ data }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600;">${params.name}</div>
              <div>持仓: ${params.data.count} 只</div>
              <div>金额: ¥${params.data.cost.toLocaleString()}</div>
              <div>占比: ${params.percent.toFixed(1)}%</div>
            </div>
          `
        },
      },
      legend: {
        ...chartTheme.legend,
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: mode === 'dark' ? '#1E293B' : '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' },
          },
          data: data.map((item, index) => ({
            name: item.name,
            value: item.cost,
            count: item.count,
            cost: item.cost,
            itemStyle: { color: chartColors.series[index % chartColors.series.length] },
          })),
        },
      ],
    }
  }, [data, mode, chartTheme])

  if (!data || data.length === 0) {
    return <Empty description="暂无数据" style={{ padding: '40px 0' }} />
  }

  return <ReactECharts option={option} style={{ height: 280 }} />
}

export default IndustryPieChart
