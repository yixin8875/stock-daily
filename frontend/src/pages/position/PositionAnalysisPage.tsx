import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Spin, Typography, Tag, Alert, Space } from 'antd'
import { PieChartOutlined, WarningOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { positionService, type PositionAnalysis } from '@/services'
import { IndustryPieChart, PositionBarChart } from './components'

const { Title } = Typography

const PositionAnalysisPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<PositionAnalysis | null>(null)

  useEffect(() => {
    fetchAnalysis()
  }, [])

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      const res = await positionService.getAnalysis()
      if (res.data.success) {
        setAnalysis(res.data.data)
      }
    } catch (error) {
      console.error('获取持仓分析失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <PieChartOutlined style={{ marginRight: 8 }} />
        持仓分析
      </Title>

      <Spin spinning={loading}>
        {/* 汇总统计 */}
        {analysis && (
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="持仓股票数" value={analysis.summary.stockCount} suffix="只" />
              </Col>
              <Col span={6}>
                <Statistic title="总成本" value={analysis.summary.totalCost} precision={2} prefix="¥" />
              </Col>
              <Col span={6}>
                <Statistic title="总市值" value={analysis.summary.totalValue} precision={2} prefix="¥" />
              </Col>
              <Col span={6}>
                <Statistic
                  title="总盈亏"
                  value={analysis.summary.totalProfit}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: analysis.summary.totalProfit >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* 图表区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card title="行业分布">
              <IndustryPieChart data={analysis?.industryDistribution || []} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="仓位占比 (Top 10)">
              <PositionBarChart data={analysis?.positionDistribution || []} />
            </Card>
          </Col>
        </Row>

        {/* 风险提示 */}
        {analysis && (
          <Card title={<><WarningOutlined /> 风险分析</>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {analysis.riskAnalysis.highRisk.length > 0 && (
                <Alert
                  type="error"
                  message="高风险持仓 (占比>30%)"
                  description={analysis.riskAnalysis.highRisk.join(', ')}
                />
              )}
              {analysis.riskAnalysis.mediumRisk.length > 0 && (
                <Alert
                  type="warning"
                  message="中风险持仓 (占比15%-30%)"
                  description={analysis.riskAnalysis.mediumRisk.join(', ')}
                />
              )}
              {analysis.riskAnalysis.lowRisk.length > 0 && (
                <Alert
                  type="success"
                  message="低风险持仓 (占比<15%)"
                  description={analysis.riskAnalysis.lowRisk.join(', ')}
                />
              )}
            </Space>
          </Card>
        )}
      </Spin>
    </div>
  )
}

export default PositionAnalysisPage
