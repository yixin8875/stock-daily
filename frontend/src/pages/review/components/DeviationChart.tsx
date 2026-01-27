import React, { useMemo } from 'react'
import { Card, Space, Empty } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { DeviationTrend } from '@/types/review'
import { useThemeStore } from '@/stores'
import { getChartTheme } from '@/utils/chartTheme'

interface DeviationChartProps {
  data: DeviationTrend[]
}

const DeviationChart: React.FC<DeviationChartProps> = ({ data }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!data || data.length === 0) return null

    const xData = data.map((item) => item.date.slice(5)) // MM-DD format
    const executionRateData = data.map((item) => item.executionRate)
    const deviationData = data.map((item) => Math.abs(item.avgDeviation))

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        formatter: (params: any) => {
          const date = data[params[0].dataIndex].date
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600; margin-bottom: 8px;">${date}</div>
              ${params.map((p: any) => `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="width: 10px; height: 10px; border-radius: 50%; background: ${p.color};"></span>
                  <span>${p.seriesName}</span>
                  <span style="font-weight: 600; margin-left: auto;">${p.value.toFixed(1)}%</span>
                </div>
              `).join('')}
            </div>
          `
        },
      },
      legend: {
        data: ['执行率', '平均偏差'],
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
      yAxis: [
        {
          ...chartTheme.yAxis,
          type: 'value',
          name: '执行率',
          max: 100,
          axisLabel: {
            ...chartTheme.yAxis.axisLabel,
            formatter: '{value}%',
          },
        },
        {
          ...chartTheme.yAxis,
          type: 'value',
          name: '偏差',
          position: 'right',
          axisLabel: {
            ...chartTheme.yAxis.axisLabel,
            formatter: '{value}%',
          },
        },
      ],
      series: [
        {
          name: '执行率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          data: executionRateData,
          lineStyle: {
            color: '#3B82F6',
            width: 2,
          },
          itemStyle: {
            color: '#3B82F6',
          },
        },
        {
          name: '平均偏差',
          type: 'bar',
          yAxisIndex: 1,
          data: deviationData.map((val) => ({
            value: val,
            itemStyle: {
              color: val <= 2 ? '#10B981' : val <= 5 ? '#F59E0B' : '#EF4444',
              borderRadius: [4, 4, 0, 0],
            },
          })),
          barWidth: '40%',
        },
      ],
    }
  }, [data, mode, chartTheme])

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LineChartOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>执行趋势</span>
        </Space>
      }
    >
      {option ? (
        <ReactECharts option={option} style={{ height: 300 }} />
      ) : (
        <Empty description="暂无趋势数据" style={{ padding: '60px 0' }} />
      )}
    </Card>
  )
}

export default DeviationChart
