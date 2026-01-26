import React from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'
import {
  RiseOutlined,
  FallOutlined,
  PercentageOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import type { CoreMetrics } from '@/types/statistics'

interface CoreMetricsCardProps {
  metrics: CoreMetrics | null
  loading: boolean
}

const PROFIT_COLOR = '#F5222D'
const LOSS_COLOR = '#52C41A'

const CoreMetricsCard: React.FC<CoreMetricsCardProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  const winRate = metrics?.winRate ?? 0
  const profitLossRatio = metrics?.profitLossRatio ?? 0
  const totalProfit = metrics?.totalProfit ?? 0
  const totalProfitRate = metrics?.totalProfitRate ?? 0
  const maxDrawdown = metrics?.maxDrawdown ?? 0
  const maxDrawdownRate = metrics?.maxDrawdownRate ?? 0

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="胜率"
            value={winRate}
            precision={2}
            suffix="%"
            prefix={<PercentageOutlined />}
            valueStyle={{ color: winRate >= 50 ? PROFIT_COLOR : LOSS_COLOR }}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            盈利 {metrics?.winCount ?? 0} 次 / 总计 {metrics?.totalCount ?? 0} 次
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="盈亏比"
            value={profitLossRatio}
            precision={2}
            suffix=":1"
            prefix={profitLossRatio >= 1 ? <RiseOutlined /> : <FallOutlined />}
            valueStyle={{ color: profitLossRatio >= 1 ? PROFIT_COLOR : LOSS_COLOR }}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            平均盈利 {(metrics?.avgProfit ?? 0).toFixed(2)} / 平均亏损 {(metrics?.avgLoss ?? 0).toFixed(2)}
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="总收益"
            value={totalProfit}
            precision={2}
            prefix={<DollarOutlined />}
            valueStyle={{ color: totalProfit >= 0 ? PROFIT_COLOR : LOSS_COLOR }}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            收益率: {totalProfitRate >= 0 ? '+' : ''}{totalProfitRate.toFixed(2)}%
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card hoverable>
          <Statistic
            title="最大回撤"
            value={maxDrawdown}
            precision={2}
            prefix={<FallOutlined />}
            valueStyle={{ color: LOSS_COLOR }}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
            回撤率: {maxDrawdownRate.toFixed(2)}%
          </div>
        </Card>
      </Col>
    </Row>
  )
}

export default CoreMetricsCard
