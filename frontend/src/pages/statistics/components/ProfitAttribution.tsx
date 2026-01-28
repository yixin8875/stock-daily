import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { statisticsService } from '@/services'

interface AttributionData {
  byIndustry: { name: string; profit: number }[]
  byStrategy: { name: string; profit: number }[]
  byHoldingPeriod: { name: string; profit: number }[]
  totalProfit: number
}

const ProfitAttribution: React.FC = () => {
  const [data, setData] = useState<AttributionData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await statisticsService.getSummary('all')
      const stats = res.data.data
      setData({
        totalProfit: stats?.coreMetrics?.totalProfit || 0,
        byIndustry: [
          { name: '科技', profit: 5000 },
          { name: '金融', profit: 3000 },
          { name: '消费', profit: -1000 },
          { name: '医药', profit: 2000 },
        ],
        byStrategy: [
          { name: '趋势跟踪', profit: 6000 },
          { name: '价值投资', profit: 2000 },
          { name: '短线交易', profit: 1000 },
        ],
        byHoldingPeriod: [
          { name: '1-3天', profit: 1500 },
          { name: '3-7天', profit: 3000 },
          { name: '7-30天', profit: 4000 },
          { name: '30天以上', profit: 500 },
        ],
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const getPieOption = (items: { name: string; profit: number }[], title: string) => ({
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['30%', '60%'],
      data: items.filter(i => i.profit > 0).map(i => ({
        name: i.name,
        value: i.profit,
      })),
    }],
  })

  const getBarOption = (items: { name: string; profit: number }[]) => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: items.map(i => i.name) },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [{
      type: 'bar',
      data: items.map(i => ({
        value: i.profit,
        itemStyle: { color: i.profit >= 0 ? '#cf1322' : '#3f8600' },
      })),
    }],
  })

  return (
    <Card title="盈亏归因分析">
      <Spin spinning={loading}>
        {!data ? (
          <Empty description="暂无数据" />
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Statistic
                  title="总盈亏"
                  value={data.totalProfit}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: data.totalProfit >= 0 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <ReactECharts option={getPieOption(data.byIndustry, '按行业')} style={{ height: 250 }} />
              </Col>
              <Col span={8}>
                <ReactECharts option={getPieOption(data.byStrategy, '按策略')} style={{ height: 250 }} />
              </Col>
              <Col span={8}>
                <ReactECharts option={getBarOption(data.byHoldingPeriod)} style={{ height: 250 }} />
              </Col>
            </Row>
          </>
        )}
      </Spin>
    </Card>
  )
}

export default ProfitAttribution
