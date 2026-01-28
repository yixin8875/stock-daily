import React, { useMemo } from 'react'
import { Card, Spin, Empty, Space, Row, Col, Statistic } from 'antd'
import { SwapOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { CashFlowPoint } from '@/types/statistics'
import { useThemeStore } from '@/stores'
import { getChartTheme } from '@/utils/chartTheme'

interface CashFlowChartProps {
  data: CashFlowPoint[]
  summary: {
    totalInflow: number
    totalOutflow: number
    netFlow: number
    currentBalance: number
  } | null
  loading: boolean
}

const CashFlowChart: React.FC<CashFlowChartProps> = ({ data, summary, loading }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!data || data.length === 0) return {}

    const xData = data.map(item => item.date)
    const inflowData = data.map(item => item.inflow)
    const outflowData = data.map(item => -item.outflow)
    const balanceData = data.map(item => item.balance)

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        ...chartTheme.legend,
        data: ['流入', '流出', '余额'],
        top: 10
      },
      xAxis: {
        ...chartTheme.xAxis,
        type: 'category',
        data: xData
      },
      yAxis: [
        {
          ...chartTheme.yAxis,
          type: 'value',
          name: '资金流',
          axisLabel: { formatter: (v: number) => `${v >= 0 ? '' : ''}${v}` }
        },
        {
          ...chartTheme.yAxis,
          type: 'value',
          name: '余额',
          position: 'right'
        }
      ],
      series: [
        {
          name: '流入',
          type: 'bar',
          stack: 'flow',
          data: inflowData,
          itemStyle: { color: '#EF4444' }
        },
        {
          name: '流出',
          type: 'bar',
          stack: 'flow',
          data: outflowData,
          itemStyle: { color: '#10B981' }
        },
        {
          name: '余额',
          type: 'line',
          yAxisIndex: 1,
          data: balanceData,
          smooth: true,
          lineStyle: { color: '#1890FF', width: 2 },
          itemStyle: { color: '#1890FF' }
        }
      ]
    }
  }, [data, mode, chartTheme])

  return (
    <Card
      title={
        <Space>
          <SwapOutlined style={{ color: '#1890FF' }} />
          <span>资金流向</span>
        </Space>
      }
    >
      {/* 汇总统计 */}
      {summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Statistic
              title="总流入"
              value={summary.totalInflow}
              precision={2}
              prefix={<ArrowUpOutlined style={{ color: '#EF4444' }} />}
              valueStyle={{ color: '#EF4444', fontSize: 16 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="总流出"
              value={summary.totalOutflow}
              precision={2}
              prefix={<ArrowDownOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ color: '#10B981', fontSize: 16 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="净流入"
              value={summary.netFlow}
              precision={2}
              valueStyle={{
                color: summary.netFlow >= 0 ? '#EF4444' : '#10B981',
                fontSize: 16
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="当前余额"
              value={summary.currentBalance}
              precision={2}
              valueStyle={{ fontSize: 16 }}
            />
          </Col>
        </Row>
      )}

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

export default CashFlowChart
