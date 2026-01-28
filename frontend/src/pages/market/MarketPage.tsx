import React from 'react'
import { Typography, Space } from 'antd'
import { StockOutlined } from '@ant-design/icons'
import { SectorRotationAnalysis, MarketSentimentPanel, MoneyFlowPanel, StockScreener, MarketBreadthPanel } from './components'

const { Title } = Typography

const MarketPage: React.FC = () => {
  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <StockOutlined style={{ marginRight: 8 }} />
        市场分析
      </Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <MarketSentimentPanel />
        <MarketBreadthPanel />
        <MoneyFlowPanel />
        <SectorRotationAnalysis />
        <StockScreener />
      </Space>
    </div>
  )
}

export default MarketPage
