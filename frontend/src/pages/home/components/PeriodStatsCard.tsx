import React from 'react'
import { Card, Statistic, Row, Col, Divider } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'
import type { PeriodStats } from '@/types/dashboard'

interface PeriodStatsCardProps {
  data: PeriodStats | null
  loading?: boolean
}

const PeriodStatsCard: React.FC<PeriodStatsCardProps> = ({ data, loading }) => {
  const getProfitColor = (value: number) => {
    return value >= 0 ? '#F5222D' : '#52C41A'
  }

  const formatProfit = (value: number) => {
    const prefix = value >= 0 ? '+' : ''
    return `${prefix}${value.toFixed(2)}`
  }

  return (
    <Card
      title={
        <span>
          <LineChartOutlined style={{ marginRight: 8 }} />
          本周/本月统计
        </span>
      }
      loading={loading}
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Statistic
            title="本周盈亏"
            value={formatProfit(data?.weekProfit ?? 0)}
            valueStyle={{ color: getProfitColor(data?.weekProfit ?? 0), fontSize: '20px' }}
            suffix="元"
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="本月盈亏"
            value={formatProfit(data?.monthProfit ?? 0)}
            valueStyle={{ color: getProfitColor(data?.monthProfit ?? 0), fontSize: '20px' }}
            suffix="元"
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="本周胜率"
            value={data?.weekWinRate ?? 0}
            precision={1}
            suffix="%"
            valueStyle={{ fontSize: '20px' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="本月胜率"
            value={data?.monthWinRate ?? 0}
            precision={1}
            suffix="%"
            valueStyle={{ fontSize: '20px' }}
          />
        </Col>
      </Row>
      <Divider style={{ margin: '16px 0' }} />
      <Row gutter={[16, 16]}>
        <Col xs={12}>
          <Statistic
            title="本周交易天数"
            value={data?.weekTradeDays ?? 0}
            suffix="天"
            valueStyle={{ fontSize: '16px' }}
          />
        </Col>
        <Col xs={12}>
          <Statistic
            title="本月交易天数"
            value={data?.monthTradeDays ?? 0}
            suffix="天"
            valueStyle={{ fontSize: '16px' }}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default PeriodStatsCard
