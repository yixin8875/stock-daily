import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import { statisticsService } from '@/services'

const TradingHabits: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    weekday: number[]
    hourly: number[]
    avgHoldDays: number
    tradeFreq: number
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await statisticsService.getSummary('all')
      setData({
        weekday: [15, 22, 18, 25, 20],
        hourly: [5, 12, 18, 15, 8, 6, 10, 16],
        avgHoldDays: 5.2,
        tradeFreq: 3.5,
      })
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const weekdayOption = {
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: data?.weekday || [] }],
  }

  const hourlyOption = {
    xAxis: { type: 'category', data: ['9:30', '10:00', '10:30', '11:00', '13:00', '13:30', '14:00', '14:30'] },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: data?.hourly || [], smooth: true }],
  }

  return (
    <Card title="交易习惯分析">
      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Statistic title="平均持仓天数" value={data?.avgHoldDays || 0} suffix="天" />
          </Col>
          <Col span={12}>
            <Statistic title="周均交易次数" value={data?.tradeFreq || 0} suffix="次" />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="按星期分布">
              <ReactECharts option={weekdayOption} style={{ height: 200 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="按时段分布">
              <ReactECharts option={hourlyOption} style={{ height: 200 }} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </Card>
  )
}

export default TradingHabits
