import React, { useMemo } from 'react'
import { Card, Spin, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import type { TradeDistribution } from '@/types/statistics'

interface TradeDistributionChartProps {
  profitLoss: TradeDistribution[]
  strategy: TradeDistribution[]
  loading: boolean
}

const PROFIT_COLOR = '#F5222D'
const LOSS_COLOR = '#52C41A'

const TradeDistributionChart: React.FC<TradeDistributionChartProps> = ({
  profitLoss,
  strategy,
  loading,
}) => {
  const pieOption = useMemo(() => {
    if (!profitLoss || profitLoss.length === 0) return {}

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '盈亏分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c}次',
          },
          data: profitLoss.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: {
              color: item.type === 'profit' ? PROFIT_COLOR : LOSS_COLOR,
            },
          })),
        },
      ],
    }
  }, [profitLoss])

  const barOption = useMemo(() => {
    if (!strategy || strategy.length === 0) return {}

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: strategy.map((item) => item.name),
        axisLabel: { rotate: 30 },
      },
      yAxis: {
        type: 'value',
        name: '交易次数',
      },
      series: [
        {
          name: '交易次数',
          type: 'bar',
          data: strategy.map((item) => ({
            value: item.value,
            itemStyle: {
              color: '#1890ff',
            },
          })),
          barWidth: '60%',
        },
      ],
    }
  }, [strategy])

  const hasData = profitLoss.length > 0 || strategy.length > 0

  return (
    <Card title="交易分布">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : !hasData ? (
        <Empty description="暂无数据" />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {profitLoss.length > 0 && (
            <div style={{ flex: 1, minWidth: 280 }}>
              <h4 style={{ textAlign: 'center', marginBottom: 8 }}>盈亏分布</h4>
              <ReactECharts option={pieOption} style={{ height: 280 }} />
            </div>
          )}
          {strategy.length > 0 && (
            <div style={{ flex: 1, minWidth: 280 }}>
              <h4 style={{ textAlign: 'center', marginBottom: 8 }}>策略分布</h4>
              <ReactECharts option={barOption} style={{ height: 280 }} />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default TradeDistributionChart
