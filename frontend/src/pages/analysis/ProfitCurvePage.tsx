import React, { useEffect, useState } from 'react'
import { Card, DatePicker, Space, Typography, Statistic, Row, Col, Spin, Empty } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import dayjs, { Dayjs } from 'dayjs'
import { analysisService, type ProfitPoint, type DrawdownInfo } from '@/services'
import { EquityCurveCompare } from './components'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const ProfitCurvePage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [curve, setCurve] = useState<ProfitPoint[]>([])
  const [drawdown, setDrawdown] = useState<DrawdownInfo | null>(null)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(3, 'month'),
    dayjs(),
  ])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [startDate, endDate] = dateRange
      const res = await analysisService.getProfitCurve(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      )
      setCurve(res.data.data?.curve || [])
      setDrawdown(res.data.data?.drawdown || null)
    } catch (error) {
      console.error('获取收益曲线失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0]
        if (!point) return ''
        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold;">${point.axisValue}</div>
            <div>累计收益: ¥${point.data.toFixed(2)}</div>
          </div>
        `
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: curve.map(p => p.date),
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => `¥${v}` },
    },
    series: [
      {
        name: '累计收益',
        type: 'line',
        data: curve.map(p => p.cumulativeProfit),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
        lineStyle: { color: '#1890ff', width: 2 },
        itemStyle: { color: '#1890ff' },
      },
    ],
  }

  const lastPoint = curve[curve.length - 1]
  const totalProfit = lastPoint?.cumulativeProfit || 0
  const totalProfitRate = lastPoint?.cumulativeProfitRate || 0

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>收益曲线</Title>
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="累计收益"
              value={totalProfit}
              precision={2}
              prefix={totalProfit >= 0 ? '+¥' : '¥'}
              valueStyle={{ color: totalProfit >= 0 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="累计收益率"
              value={totalProfitRate}
              precision={2}
              suffix="%"
              prefix={totalProfitRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: totalProfitRate >= 0 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="最大回撤"
              value={drawdown?.maxDrawdownRate || 0}
              precision={2}
              suffix="%"
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="最大回撤金额"
              value={drawdown?.maxDrawdown || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Spin spinning={loading}>
          {curve.length > 0 ? (
            <ReactECharts option={chartOption} style={{ height: 400 }} />
          ) : (
            <Empty description="暂无收益数据" />
          )}
        </Spin>
      </Card>

      {drawdown && drawdown.drawdownStart && (
        <Card style={{ marginTop: 16 }}>
          <Title level={5}>回撤详情</Title>
          <Space direction="vertical">
            <Text>回撤开始: {drawdown.drawdownStart}</Text>
            <Text>回撤结束: {drawdown.drawdownEnd}</Text>
            <Text type="danger">最大回撤: ¥{drawdown.maxDrawdown.toFixed(2)} ({drawdown.maxDrawdownRate.toFixed(2)}%)</Text>
          </Space>
        </Card>
      )}

      <div style={{ marginTop: 16 }}>
        <EquityCurveCompare />
      </div>
    </div>
  )
}

export default ProfitCurvePage
