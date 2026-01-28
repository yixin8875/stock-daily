import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Tag, Spin } from 'antd'
import { RiseOutlined, FallOutlined, ThunderboltOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { stockService, type MarketSentiment } from '@/services'

const sentimentLabels: Record<string, { text: string; color: string }> = {
  extreme_fear: { text: '极度恐惧', color: '#10B981' },
  fear: { text: '恐惧', color: '#34D399' },
  neutral: { text: '中性', color: '#6B7280' },
  greed: { text: '贪婪', color: '#F59E0B' },
  extreme_greed: { text: '极度贪婪', color: '#EF4444' },
}

// 情绪仪表盘
const SentimentGauge: React.FC<{ sentiment: MarketSentiment }> = ({ sentiment }) => {
  const label = sentimentLabels[sentiment.sentimentLevel]
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 5,
      pointer: { show: true, length: '60%', width: 6 },
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[0.2, '#10B981'], [0.4, '#34D399'], [0.6, '#6B7280'], [0.8, '#F59E0B'], [1, '#EF4444']],
        },
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { formatter: '{value}', fontSize: 24, offsetCenter: [0, '20%'] },
      data: [{ value: sentiment.sentimentScore }],
    }],
  }
  return (
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <ReactECharts option={option} style={{ height: 200 }} />
      <Tag color={label.color} style={{ fontSize: 16, padding: '4px 16px' }}>{label.text}</Tag>
    </div>
  )
}

// 市场统计数据
const MarketStats: React.FC<{ sentiment: MarketSentiment }> = ({ sentiment }) => (
  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
    <Col span={6}>
      <Statistic title="上涨家数" value={sentiment.advanceCount} valueStyle={{ color: '#EF4444' }} prefix={<RiseOutlined />} />
    </Col>
    <Col span={6}>
      <Statistic title="下跌家数" value={sentiment.declineCount} valueStyle={{ color: '#10B981' }} prefix={<FallOutlined />} />
    </Col>
    <Col span={6}>
      <Statistic title="涨停" value={sentiment.limitUpCount} valueStyle={{ color: '#EF4444' }} />
    </Col>
    <Col span={6}>
      <Statistic title="跌停" value={sentiment.limitDownCount} valueStyle={{ color: '#10B981' }} />
    </Col>
    <Col span={8}>
      <Statistic title="涨跌比" value={sentiment.advanceDeclineRatio} precision={2} />
    </Col>
    <Col span={8}>
      <Statistic title="平均涨幅" value={sentiment.averageChange} precision={2} suffix="%" valueStyle={{ color: sentiment.averageChange >= 0 ? '#EF4444' : '#10B981' }} />
    </Col>
    <Col span={8}>
      <Statistic title="量比" value={sentiment.volumeRatio} precision={2} />
    </Col>
  </Row>
)

// 情绪历史趋势
const SentimentHistory: React.FC<{ history: MarketSentiment[] }> = ({ history }) => {
  if (history.length === 0) return null
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: history.map(h => h.date) },
    yAxis: { type: 'value', min: 0, max: 100 },
    series: [{
      type: 'line',
      data: history.map(h => h.sentimentScore),
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#1890FF' },
    }],
  }
  return (
    <Card type="inner" title="情绪趋势" size="small">
      <ReactECharts option={option} style={{ height: 200 }} />
    </Card>
  )
}

const MarketSentimentPanel: React.FC = () => {
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null)
  const [history, setHistory] = useState<MarketSentiment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sentimentRes, historyRes] = await Promise.all([
        stockService.getMarketSentiment(),
        stockService.getSentimentHistory(30),
      ])
      setSentiment(sentimentRes.data.data || null)
      setHistory(historyRes.data.data || [])
    } catch {
      setSentiment(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title={<><ThunderboltOutlined style={{ marginRight: 8 }} />大盘情绪指标</>}>
      <Spin spinning={loading}>
        {sentiment && (
          <>
            <SentimentGauge sentiment={sentiment} />
            <MarketStats sentiment={sentiment} />
            <SentimentHistory history={history} />
          </>
        )}
      </Spin>
    </Card>
  )
}

export default MarketSentimentPanel
