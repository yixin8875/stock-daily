import React, { useState, useEffect } from 'react'
import { Card, Select, Spin, Empty, Space } from 'antd'
import ReactECharts from 'echarts-for-react'
import { analysisService } from '@/services'

const EquityCurveCompare: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [benchmark, setBenchmark] = useState('sh000001')
  const [data, setData] = useState<{
    dates: string[]
    portfolio: number[]
    index: number[]
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [benchmark])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await analysisService.getProfitCurve('all')
      const curve = res.data.data?.curve || []

      const dates = curve.map((p) => p.date)
      const portfolio = curve.map((p) => p.cumulativeProfit)

      // 模拟指数数据
      const index = curve.map((_, i: number) => {
        return Math.sin(i / 10) * 5000 + i * 100
      })

      setData({ dates, portfolio, index })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const getOption = () => {
    if (!data) return {}
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['我的收益', '基准指数'] },
      xAxis: { type: 'category', data: data.dates },
      yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
      series: [
        {
          name: '我的收益',
          type: 'line',
          data: data.portfolio,
          smooth: true,
          itemStyle: { color: '#1890ff' },
        },
        {
          name: '基准指数',
          type: 'line',
          data: data.index,
          smooth: true,
          itemStyle: { color: '#faad14' },
        },
      ],
    }
  }

  return (
    <Card
      title="资金曲线对比"
      extra={
        <Space>
          <span>对比基准:</span>
          <Select
            value={benchmark}
            onChange={setBenchmark}
            style={{ width: 120 }}
            options={[
              { label: '上证指数', value: 'sh000001' },
              { label: '深证成指', value: 'sz399001' },
              { label: '创业板指', value: 'sz399006' },
              { label: '沪深300', value: 'sh000300' },
            ]}
          />
        </Space>
      }
    >
      <Spin spinning={loading}>
        {!data ? (
          <Empty description="暂无数据" />
        ) : (
          <ReactECharts option={getOption()} style={{ height: 350 }} />
        )}
      </Spin>
    </Card>
  )
}

export default EquityCurveCompare
