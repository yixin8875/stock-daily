import React from 'react'
import { Card, Row, Col, Statistic, Descriptions } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface BacktestMetrics {
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  sortinoRatio: number
  calmarRatio: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  maxConsecutiveWins: number
  maxConsecutiveLosses: number
}

interface Props {
  metrics?: BacktestMetrics
}

const BacktestMetricsPanel: React.FC<Props> = ({ metrics }) => {
  const defaultMetrics: BacktestMetrics = metrics || {
    totalReturn: 25.5,
    annualizedReturn: 18.2,
    maxDrawdown: 12.3,
    sharpeRatio: 1.45,
    sortinoRatio: 2.1,
    calmarRatio: 1.48,
    winRate: 58.5,
    profitFactor: 1.8,
    avgWin: 3500,
    avgLoss: 1800,
    maxConsecutiveWins: 6,
    maxConsecutiveLosses: 3,
  }

  return (
    <Card title="回测指标详情" size="small">
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title="总收益率"
            value={defaultMetrics.totalReturn}
            precision={2}
            suffix="%"
            valueStyle={{ color: defaultMetrics.totalReturn >= 0 ? '#cf1322' : '#3f8600' }}
            prefix={defaultMetrics.totalReturn >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="年化收益"
            value={defaultMetrics.annualizedReturn}
            precision={2}
            suffix="%"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="最大回撤"
            value={defaultMetrics.maxDrawdown}
            precision={2}
            suffix="%"
            valueStyle={{ color: '#f5222d' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="胜率"
            value={defaultMetrics.winRate}
            precision={1}
            suffix="%"
          />
        </Col>
      </Row>

      <Descriptions
        bordered
        size="small"
        column={3}
        style={{ marginTop: 16 }}
      >
        <Descriptions.Item label="夏普比率">
          {defaultMetrics.sharpeRatio.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="索提诺比率">
          {defaultMetrics.sortinoRatio.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="卡玛比率">
          {defaultMetrics.calmarRatio.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="盈亏比">
          {defaultMetrics.profitFactor.toFixed(2)}
        </Descriptions.Item>
        <Descriptions.Item label="平均盈利">
          ¥{defaultMetrics.avgWin.toFixed(0)}
        </Descriptions.Item>
        <Descriptions.Item label="平均亏损">
          ¥{defaultMetrics.avgLoss.toFixed(0)}
        </Descriptions.Item>
        <Descriptions.Item label="最大连胜">
          {defaultMetrics.maxConsecutiveWins}次
        </Descriptions.Item>
        <Descriptions.Item label="最大连亏">
          {defaultMetrics.maxConsecutiveLosses}次
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default BacktestMetricsPanel
