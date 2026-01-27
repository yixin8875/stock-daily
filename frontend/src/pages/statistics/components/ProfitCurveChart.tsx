import React, { useState, useMemo } from 'react'
import { Card, Spin, Radio, Empty, Space } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ProfitCurvePoint } from '@/types/statistics'
import { useThemeStore } from '@/stores'
import { chartColors, getChartTheme, createGradient, getProfitLossColor } from '@/utils/chartTheme'

interface ProfitCurveChartProps {
  data: ProfitCurvePoint[]
  loading: boolean
}

type DisplayMode = 'amount' | 'rate'

const ProfitCurveChart: React.FC<ProfitCurveChartProps> = ({ data, loading }) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('amount')
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    const xData = data.map((item) => item.date)
    const yData = data.map((item) =>
      displayMode === 'amount' ? item.profit : item.profitRate
    )

    const lastValue = yData[yData.length - 1] || 0
    const lineColor = getProfitLossColor(lastValue, mode)

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        formatter: (params: any) => {
          const point = params[0]
          const value = point.value
          const suffix = displayMode === 'amount' ? ' 元' : '%'
          const prefix = value >= 0 ? '+' : ''
          return `
            <div style="padding: 4px 0;">
              <div style="font-weight: 600; margin-bottom: 8px;">${point.axisValue}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${lineColor};"></span>
                <span>累计收益</span>
                <span style="font-weight: 600; color: ${lineColor}; margin-left: auto;">${prefix}${value.toFixed(2)}${suffix}</span>
              </div>
            </div>
          `
        },
      },
      xAxis: {
        ...chartTheme.xAxis,
        type: 'category',
        boundaryGap: false,
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
          formatter: (value: number) => {
            const prefix = value >= 0 ? '+' : ''
            return displayMode === 'amount' ? `${prefix}${value}` : `${prefix}${value}%`
          },
        },
      },
      series: [
        {
          name: '累计收益',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          data: yData,
          lineStyle: {
            color: lineColor,
            width: 3,
          },
          areaStyle: {
            color: createGradient(lineColor),
          },
          itemStyle: {
            color: lineColor,
            borderWidth: 2,
            borderColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
          },
          emphasis: {
            showSymbol: true,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: lineColor + '40',
            },
          },
        },
      ],
    }
  }, [data, displayMode, mode, chartTheme])

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${chartColors.profit} 0%, #059669 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LineChartOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>收益曲线</span>
        </Space>
      }
      extra={
        <Radio.Group
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value)}
          size="small"
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="amount">金额</Radio.Button>
          <Radio.Button value="rate">百分比</Radio.Button>
        </Radio.Group>
      }
      styles={{
        body: { padding: '16px 20px' },
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : data.length === 0 ? (
        <Empty description="暂无数据" style={{ padding: '60px 0' }} />
      ) : (
        <ReactECharts option={option} style={{ height: 350 }} />
      )}
    </Card>
  )
}

export default ProfitCurveChart
