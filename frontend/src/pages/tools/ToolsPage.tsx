import React from 'react'
import { Typography, Space, Tabs } from 'antd'
import { ToolOutlined } from '@ant-design/icons'
import {
  GridCalculator,
  DipCalculator,
  TechnicalIndicatorPanel,
  CostCalculator,
  DividendManager,
  LearningNotes,
  TradingSimulator,
  SmartDipPlanner,
  BatchBuyCalculator,
  BreakevenAnalyzer,
  StopLossAdvisor,
  PositionManager,
  PortfolioOptimizer,
  FactorAnalysis,
  EventDrivenStrategy,
  StrategyTemplatePanel,
  TradePlanTemplatePanel,
} from './components'

const { Title } = Typography

const ToolsPage: React.FC = () => {
  const items = [
    {
      key: 'basic',
      label: '基础工具',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <TechnicalIndicatorPanel />
          <CostCalculator />
          <GridCalculator />
          <DipCalculator />
        </Space>
      ),
    },
    {
      key: 'position',
      label: '仓位管理',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <PositionManager />
          <BatchBuyCalculator />
          <StopLossAdvisor />
          <BreakevenAnalyzer />
        </Space>
      ),
    },
    {
      key: 'strategy',
      label: '策略分析',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <FactorAnalysis />
          <EventDrivenStrategy />
          <PortfolioOptimizer />
          <SmartDipPlanner />
          <StrategyTemplatePanel />
          <TradePlanTemplatePanel />
        </Space>
      ),
    },
    {
      key: 'other',
      label: '其他工具',
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <DividendManager />
          <LearningNotes />
          <TradingSimulator />
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <ToolOutlined style={{ marginRight: 8 }} />
        交易工具
      </Title>
      <Tabs items={items} />
    </div>
  )
}

export default ToolsPage
