import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Progress, Tag, Spin, Empty } from 'antd'
import { portfolioService, stockService, positionService, type StockQuote } from '@/services'

interface RiskData {
  totalRisk: number
  volatility: number
  maxDrawdown: number
  sharpeRatio: number
  beta: number
  concentrationRisk: number
}

const RiskAssessment: React.FC = () => {
  const [data, setData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const posRes = await positionService.getPositions()
      const positions = posRes.data.data || []
      if (positions.length === 0) {
        setData(null)
        return
      }

      const codes = positions.map(p => p.stockCode)
      const quoteRes = await stockService.getQuotes(codes)
      const quotes: Record<string, number> = {}
      quoteRes.data.data?.forEach((q: StockQuote) => {
        quotes[q.code] = q.price
      })

      const res = await portfolioService.getRiskMetrics(quotes)
      const metrics = res.data.data
      setData({
        totalRisk: metrics.volatility * 100,
        volatility: metrics.volatility * 100,
        maxDrawdown: metrics.maxDrawdown * 100,
        sharpeRatio: metrics.sharpeRatio,
        beta: metrics.beta,
        concentrationRisk: metrics.concentrationRisk,
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: number) => {
    if (risk < 30) return '#52c41a'
    if (risk < 60) return '#faad14'
    return '#f5222d'
  }

  const getRiskLevel = (risk: number) => {
    if (risk < 30) return '低风险'
    if (risk < 60) return '中风险'
    return '高风险'
  }

  return (
    <Card title="风险评估报告">
      <Spin spinning={loading}>
        {!data ? (
          <Empty description="暂无数据" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="综合风险评分"
                    value={data.totalRisk.toFixed(1)}
                    suffix="%"
                    valueStyle={{ color: getRiskColor(data.totalRisk) }}
                  />
                  <Progress
                    percent={data.totalRisk}
                    strokeColor={getRiskColor(data.totalRisk)}
                    showInfo={false}
                  />
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <Tag color={getRiskColor(data.totalRisk)}>{getRiskLevel(data.totalRisk)}</Tag>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="波动率" value={data.volatility.toFixed(2)} suffix="%" />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="最大回撤"
                    value={data.maxDrawdown.toFixed(2)}
                    suffix="%"
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="夏普比率" value={data.sharpeRatio.toFixed(2)} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="Beta系数" value={data.beta.toFixed(2)} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="集中度风险" value={data.concentrationRisk.toFixed(1)} suffix="%" />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Spin>
    </Card>
  )
}

export default RiskAssessment
