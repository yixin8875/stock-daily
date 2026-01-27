import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Space, Tag, List, Alert, Spin, Empty, Progress } from 'antd'
import {
  BulbOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { analysisService } from '@/services'
import type { AIAnalysisResult, TradingInsight, RiskAlert } from '@/services'

const { Title, Text, Paragraph } = Typography

const AIAnalysisPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null)

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      const response = await analysisService.getAnalysis()
      setAnalysis(response.data.data)
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const getInsightIcon = (type: TradingInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52C41A' }} />
      case 'warning':
        return <WarningOutlined style={{ color: '#FAAD14' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#1890FF' }} />
    }
  }

  const getRiskColor = (level: RiskAlert['level']) => {
    switch (level) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      default:
        return 'blue'
    }
  }

  const getRiskLabel = (level: RiskAlert['level']) => {
    switch (level) {
      case 'high':
        return '高风险'
      case 'medium':
        return '中风险'
      default:
        return '低风险'
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">正在分析您的交易数据...</Text>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return <Empty description="暂无分析数据" />
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <ThunderboltOutlined style={{ marginRight: 8 }} />
        AI 智能分析
      </Title>

      {/* 总结 */}
      <Alert
        message="分析总结"
        description={analysis.summary}
        type={analysis.riskAlerts.some(r => r.level === 'high') ? 'warning' : 'info'}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        {/* 风险警告 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: '#FF4D4F' }} />
                <span>风险警告</span>
                {analysis.riskAlerts.length > 0 && (
                  <Tag color="red">{analysis.riskAlerts.length}</Tag>
                )}
              </Space>
            }
          >
            {analysis.riskAlerts.length > 0 ? (
              <List
                dataSource={analysis.riskAlerts}
                renderItem={(alert) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Space style={{ marginBottom: 4 }}>
                        <Tag color={getRiskColor(alert.level)}>{getRiskLabel(alert.level)}</Tag>
                        <Text strong>{alert.type}</Text>
                      </Space>
                      <Paragraph style={{ margin: 0 }}>{alert.message}</Paragraph>
                      {alert.relatedStocks && alert.relatedStocks.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          {alert.relatedStocks.map((stock, idx) => (
                            <Tag key={idx} style={{ marginTop: 4 }}>{stock}</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无风险警告" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* 交易洞察 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BulbOutlined style={{ color: '#FAAD14' }} />
                <span>交易洞察</span>
              </Space>
            }
          >
            {analysis.insights.length > 0 ? (
              <List
                dataSource={analysis.insights}
                renderItem={(insight) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Space style={{ marginBottom: 4 }}>
                        {getInsightIcon(insight.type)}
                        <Text strong>{insight.title}</Text>
                      </Space>
                      <Paragraph style={{ margin: 0 }}>{insight.description}</Paragraph>
                      {insight.suggestion && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          建议: {insight.suggestion}
                        </Text>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无洞察" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* 策略分析 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined style={{ color: '#1890FF' }} />
                <span>策略表现</span>
              </Space>
            }
          >
            {analysis.patterns.length > 0 ? (
              <List
                dataSource={analysis.patterns}
                renderItem={(pattern) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>{pattern.pattern}</Text>
                        <Text type="secondary">{pattern.frequency}次</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>胜率</Text>
                          <Progress
                            percent={pattern.winRate}
                            size="small"
                            status={pattern.winRate >= 50 ? 'success' : 'exception'}
                          />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>平均收益</Text>
                          <div>
                            <Text
                              strong
                              style={{ color: pattern.avgProfit >= 0 ? '#F5222D' : '#52C41A' }}
                            >
                              {pattern.avgProfit >= 0 ? '+' : ''}{pattern.avgProfit}元
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无策略数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* 建议 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52C41A' }} />
                <span>改进建议</span>
              </Space>
            }
          >
            {analysis.suggestions.length > 0 ? (
              <List
                dataSource={analysis.suggestions}
                renderItem={(suggestion, index) => (
                  <List.Item>
                    <Space align="start">
                      <Tag color="blue">{index + 1}</Tag>
                      <Text>{suggestion}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无建议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AIAnalysisPage
