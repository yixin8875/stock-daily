import React, { useEffect, useState, useCallback } from 'react'
import { Card, Row, Col, Typography, Statistic, Spin, Empty, List, Tag, Alert, Progress, Space, Tooltip } from 'antd'
import {
  WarningOutlined, PieChartOutlined, SafetyOutlined, FundOutlined,
  ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import {
  portfolioService, stockService, positionService,
  type PortfolioAnalysis, type StockQuote
} from '@/services'
import { useThemeStore } from '@/stores'
import { getChartTheme, chartColors } from '@/utils/chartTheme'
import { CorrelationAnalysis, IndustryAdvicePanel, RebalancePanel, RiskAssessment } from './components'

const { Title, Text } = Typography

const PortfolioPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const fetchAnalysis = useCallback(async () => {
    setLoading(true)
    try {
      // 先获取持仓列表
      const posRes = await positionService.getPositions()
      const positions = posRes.data.data || []
      if (positions.length === 0) {
        setAnalysis(null)
        setLoading(false)
        return
      }

      // 获取实时行情
      const codes = positions.map(p => p.stockCode)
      const quoteRes = await stockService.getQuotes(codes)
      const quotes: Record<string, number> = {}
      quoteRes.data.data?.forEach((q: StockQuote) => {
        quotes[q.code] = q.price
      })

      // 获取组合分析
      const res = await portfolioService.getPortfolioAnalysis(quotes)
      setAnalysis(res.data.data || null)
    } catch (error) {
      console.error('获取组合分析失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalysis() }, [fetchAnalysis])

  const pieOption = analysis ? {
    ...chartTheme,
    tooltip: { ...chartTheme.tooltip, trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { ...chartTheme.legend, orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: mode === 'dark' ? '#1E293B' : '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: analysis.distribution.map((d, i) => ({
        name: d.industry,
        value: Math.round(d.marketValue),
        itemStyle: { color: chartColors.series[i % chartColors.series.length] },
      })),
    }],
  } : {}

  const warningTypeLabels: Record<string, { label: string; color: string }> = {
    OVERWEIGHT: { label: '仓位过重', color: 'orange' },
    STOP_LOSS: { label: '触及止损', color: 'red' },
    TAKE_PROFIT: { label: '达到目标', color: 'green' },
    HIGH_LOSS: { label: '大幅亏损', color: 'red' },
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">正在分析投资组合...</Text>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div style={{ padding: '0 0 24px 0' }}>
        <Title level={3}>投资组合分析</Title>
        <Empty description="暂无持仓数据，请先添加持仓" />
      </div>
    )
  }

  const { metrics, distribution, warnings } = analysis

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <FundOutlined style={{ marginRight: 8 }} />
        投资组合分析
      </Title>

      {/* 仓位预警 */}
      {warnings.length > 0 && (
        <Card
          title={<><WarningOutlined style={{ color: '#FF4D4F', marginRight: 8 }} />仓位预警</>}
          style={{ marginBottom: 24 }}
        >
          <List
            dataSource={warnings}
            renderItem={(warning) => (
              <List.Item>
                <Alert
                  message={
                    <Space>
                      <Tag color={warningTypeLabels[warning.warningType]?.color}>
                        {warningTypeLabels[warning.warningType]?.label}
                      </Tag>
                      <Text strong>{warning.stockName}</Text>
                    </Space>
                  }
                  description={warning.message}
                  type="warning"
                  showIcon
                  style={{ width: '100%' }}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 风险指标 */}
      <Card
        title={<><SafetyOutlined style={{ color: '#1890FF', marginRight: 8 }} />风险评估</>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="总市值"
              value={metrics.totalValue}
              precision={2}
              prefix="¥"
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="总成本"
              value={metrics.totalCost}
              precision={2}
              prefix="¥"
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="总盈亏"
              value={metrics.totalProfit}
              precision={2}
              prefix={metrics.totalProfit >= 0 ? '+¥' : '¥'}
              valueStyle={{ color: metrics.totalProfit >= 0 ? '#EF4444' : '#10B981' }}
              suffix={metrics.totalProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="收益率"
              value={metrics.totalProfitRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: metrics.totalProfitRate >= 0 ? '#EF4444' : '#10B981' }}
              prefix={metrics.totalProfitRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title={
                <Space>
                  <span>夏普比率</span>
                  <Tooltip title="衡量风险调整后收益的指标。大于1表示收益超过风险，越高越好。计算公式：(组合收益率-无风险利率)/组合波动率">
                    <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              value={metrics.sharpeRatio}
              precision={2}
              valueStyle={{ color: metrics.sharpeRatio >= 1 ? '#52C41A' : '#FF4D4F' }}
              suffix={metrics.sharpeRatio >= 1 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title={
                <Space>
                  <span>集中度风险</span>
                  <Tooltip title="基于HHI指数计算，衡量持仓集中程度。低于30%为分散，30-50%为适中，高于50%为集中。建议保持适度分散以降低风险">
                    <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                  </Tooltip>
                </Space>
              }
              value={metrics.concentrationRisk}
              precision={1}
              suffix="%"
              valueStyle={{ color: metrics.concentrationRisk > 50 ? '#FF4D4F' : '#52C41A' }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: 24 }}>
          <Text type="secondary">集中度风险 (HHI指数)</Text>
          <Progress
            percent={Math.min(metrics.concentrationRisk, 100)}
            status={metrics.concentrationRisk > 50 ? 'exception' : 'success'}
            format={() => `${metrics.concentrationRisk.toFixed(1)}%`}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            建议: 集中度低于50%为宜，过高表示持仓过于集中
          </Text>
        </div>
      </Card>

      {/* 行业分布 */}
      <Card
        title={<><PieChartOutlined style={{ color: '#722ED1', marginRight: 8 }} />行业分布</>}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {distribution.length > 0 ? (
              <ReactECharts option={pieOption} style={{ height: 300 }} />
            ) : (
              <Empty description="暂无行业数据" />
            )}
          </Col>
          <Col xs={24} md={12}>
            <List
              dataSource={distribution}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text strong>{item.industry}</Text>
                      <Text>{item.weight.toFixed(1)}%</Text>
                    </div>
                    <Progress
                      percent={item.weight}
                      showInfo={false}
                      size="small"
                      strokeColor={item.weight > 30 ? '#FF4D4F' : '#1890FF'}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.stockCount}只股票: {item.stocks.join(', ')}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>

      {/* 相关性分析 */}
      <CorrelationAnalysis />

      {/* 行业配置建议 */}
      <div style={{ marginTop: 24 }}>
        <IndustryAdvicePanel />
      </div>

      {/* 再平衡提醒 */}
      <div style={{ marginTop: 24 }}>
        <RebalancePanel />
      </div>

      {/* 风险评估报告 */}
      <div style={{ marginTop: 24 }}>
        <RiskAssessment />
      </div>
    </div>
  )
}

export default PortfolioPage
