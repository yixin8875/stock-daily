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
  WinRateTrendChart,
  EmotionProfitChart,
  AdvancedMetricsCard,
  ProfitAttributionChart,
  RiskWarningsPanel,
  IndexCompareChart,
  TradeHeatmap,
  CashFlowChart,
  ReviewCalendar,
  HoldingPeriodAnalysis,
  TimingAnalysis,
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
    winRateTrend,
    winRateTrendLoading,
    emotionProfit,
    emotionProfitLoading,
    advancedMetrics,
    advancedMetricsLoading,
    profitAttribution,
    profitAttributionLoading,
    riskWarnings,
    riskWarningsLoading,
    markWarningRead,
    indexCompare,
    indexCompareName,
    indexCompareLoading,
    fetchIndexCompare,
    heatmapData,
    heatmapYear,
    heatmapLoading,
    fetchHeatmap,
    cashFlowData,
    cashFlowSummary,
    cashFlowLoading,
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
        {/* 风险预警 */}
        {riskWarnings.length > 0 && (
          <RiskWarningsPanel
            warnings={riskWarnings}
            loading={riskWarningsLoading}
            onMarkRead={markWarningRead}
          />
        )}

        {/* 核心指标卡片 */}
        <CoreMetricsCard metrics={coreMetrics} loading={coreMetricsLoading} />

        {/* 高级交易指标 */}
        <AdvancedMetricsCard metrics={advancedMetrics} loading={advancedMetricsLoading} />

        {/* 收益曲线图 */}
        <ProfitCurveChart data={profitCurve} loading={profitCurveLoading} />

        {/* 收益对比和热力图 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <IndexCompareChart
              data={indexCompare}
              indexName={indexCompareName}
              loading={indexCompareLoading}
              onIndexChange={fetchIndexCompare}
            />
          </Col>
          <Col xs={24} lg={12}>
            <TradeHeatmap
              data={heatmapData}
              year={heatmapYear}
              loading={heatmapLoading}
              onYearChange={fetchHeatmap}
            />
          </Col>
        </Row>

        {/* 资金流向 */}
        <CashFlowChart
          data={cashFlowData}
          summary={cashFlowSummary}
          loading={cashFlowLoading}
        />

        {/* 月度收益柱状图 */}
        <MonthlyProfitChart data={monthlyProfit} loading={monthlyProfitLoading} />

        {/* 收益归因分析 */}
        <ProfitAttributionChart data={profitAttribution} loading={profitAttributionLoading} />

        {/* 胜率趋势和情绪分析 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <WinRateTrendChart data={winRateTrend} loading={winRateTrendLoading} />
          </Col>
          <Col xs={24} lg={12}>
            <EmotionProfitChart data={emotionProfit} loading={emotionProfitLoading} />
          </Col>
        </Row>

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

        {/* 交易复盘日历 */}
        <ReviewCalendar />

        {/* 持仓周期和交易时机分析 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <HoldingPeriodAnalysis period={period} />
          </Col>
          <Col xs={24} lg={12}>
            <TimingAnalysis period={period} />
          </Col>
        </Row>
      </Space>
    </div>
  )
}

export default StatisticsPage
