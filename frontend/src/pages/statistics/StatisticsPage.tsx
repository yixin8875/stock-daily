import React, { useEffect } from 'react'
import { Typography, Radio, Space, Row, Col } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { useStatisticsStore } from '@/stores/statisticsStore'
import type { StatisticsPeriod } from '@/types/statistics'
import {
  CoreMetricsCard,
  ProfitCurveChart,
  TradeDistributionChart,
  MonthlyProfitChart,
  TradeStatsTable,
  StockTradesSummary,
} from './components'

const { Title } = Typography

const periodOptions = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '全部', value: 'all' },
]

const StatisticsPage: React.FC = () => {
  const {
    period,
    setPeriod,
    coreMetrics,
    coreMetricsLoading,
    tradeStats,
    profitCurve,
    profitCurveLoading,
    tradeDistribution,
    tradeDistributionLoading,
    monthlyProfit,
    monthlyProfitLoading,
    fetchAllData,
  } = useStatisticsStore()

  useEffect(() => {
    fetchAllData()
  }, [])

  const handlePeriodChange = (e: RadioChangeEvent) => {
    setPeriod(e.target.value as StatisticsPeriod)
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Title level={3} style={{ margin: 0 }}>统计分析</Title>
        <Radio.Group
          value={period}
          onChange={handlePeriodChange}
          optionType="button"
          buttonStyle="solid"
        >
          {periodOptions.map((opt) => (
            <Radio.Button key={opt.value} value={opt.value}>
              {opt.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 核心指标卡片 */}
        <CoreMetricsCard metrics={coreMetrics} loading={coreMetricsLoading} />

        {/* 收益曲线图 */}
        <ProfitCurveChart data={profitCurve} loading={profitCurveLoading} />

        {/* 月度收益柱状图 */}
        <MonthlyProfitChart data={monthlyProfit} loading={monthlyProfitLoading} />

        {/* 交易分布图和交易统计表格 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <TradeDistributionChart
              profitLoss={tradeDistribution.profitLoss}
              strategy={tradeDistribution.strategy}
              loading={tradeDistributionLoading}
            />
          </Col>
          <Col xs={24} lg={10}>
            <TradeStatsTable stats={tradeStats} loading={coreMetricsLoading} />
          </Col>
        </Row>

        {/* 股票交易汇总 */}
        <StockTradesSummary />
      </Space>
    </div>
  )
}

export default StatisticsPage
