import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Progress, Alert, List, Tag, Spin } from 'antd'
import { AimOutlined } from '@ant-design/icons'
import { statisticsService } from '@/services'
import type { TimingAnalysisData } from '@/types/statistics'
import type { StatisticsPeriod } from '@/types/statistics'

interface Props {
  period: StatisticsPeriod
}

const TimingAnalysis: React.FC<Props> = ({ period }) => {
  const [buyTiming, setBuyTiming] = useState<TimingAnalysisData | null>(null)
  const [sellTiming, setSellTiming] = useState<TimingAnalysisData | null>(null)
  const [overallScore, setOverallScore] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await statisticsService.getTimingAnalysis(period)
      setBuyTiming(res.data.data?.buyTiming || null)
      setSellTiming(res.data.data?.sellTiming || null)
      setOverallScore(res.data.data?.overallScore || 0)
    } catch {
      setBuyTiming(null)
      setSellTiming(null)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52C41A'
    if (score >= 60) return '#1890FF'
    if (score >= 40) return '#FAAD14'
    return '#FF4D4F'
  }

  const renderTimingCard = (data: TimingAnalysisData | null, title: string, color: string) => {
    if (!data) return null
    return (
      <Card type="inner" title={<Tag color={color}>{title}</Tag>} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Progress
              type="circle"
              percent={data.accuracy}
              strokeColor={getScoreColor(data.accuracy)}
              format={p => `${p}%`}
            />
            <div style={{ textAlign: 'center', marginTop: 8 }}>准确率</div>
          </Col>
          <Col span={16}>
            <p>平均偏差: <Tag>{data.avgDeviation.toFixed(2)}%</Tag></p>
            <p>最佳时机: <Tag color="green">+{data.bestTiming.toFixed(2)}%</Tag></p>
            <p>最差时机: <Tag color="red">{data.worstTiming.toFixed(2)}%</Tag></p>
          </Col>
        </Row>
        {data.suggestions.length > 0 && (
          <List
            size="small"
            header={<strong>改进建议</strong>}
            dataSource={data.suggestions}
            renderItem={item => <List.Item>{item}</List.Item>}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>
    )
  }

  return (
    <Card title={<><AimOutlined style={{ marginRight: 8 }} />交易时机分析</>}>
      <Spin spinning={loading}>
        <Alert
          type={overallScore >= 60 ? 'success' : 'warning'}
          message={`综合评分: ${overallScore}分`}
          description={overallScore >= 80 ? '时机把握优秀' : overallScore >= 60 ? '时机把握良好' : '时机把握需改进'}
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col span={12}>{renderTimingCard(buyTiming, '买入时机', 'green')}</Col>
          <Col span={12}>{renderTimingCard(sellTiming, '卖出时机', 'red')}</Col>
        </Row>
      </Spin>
    </Card>
  )
}

export default TimingAnalysis
