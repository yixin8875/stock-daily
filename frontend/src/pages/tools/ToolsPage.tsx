import React from 'react'
import { Typography, Space } from 'antd'
import { ToolOutlined } from '@ant-design/icons'
import { GridCalculator, DipCalculator, TechnicalIndicatorPanel, CostCalculator, DividendManager, LearningNotes } from './components'

const { Title } = Typography

const ToolsPage: React.FC = () => {
  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <ToolOutlined style={{ marginRight: 8 }} />
        交易工具
      </Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <TechnicalIndicatorPanel />
        <CostCalculator />
        <GridCalculator />
        <DipCalculator />
        <DividendManager />
        <LearningNotes />
      </Space>
    </div>
  )
}

export default ToolsPage
