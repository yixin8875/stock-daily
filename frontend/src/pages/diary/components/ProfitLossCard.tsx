import React from 'react'
import { Card, InputNumber, Row, Col, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { useDiaryStore } from '@/stores/diaryStore'

const ProfitLossCard: React.FC = () => {
  const { profitLoss, setProfitLoss } = useDiaryStore()

  const getProfitColor = (value: number | null) => {
    if (value === null || value === 0) return '#000'
    return value > 0 ? '#cf1322' : '#3f8600' // 中国股市：红涨绿跌
  }

  const getProfitIcon = (value: number | null) => {
    if (value === null || value === 0) return null
    return value > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
  }

  return (
    <Card title="盈亏情况" style={{ marginBottom: 16 }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>今日盈亏金额</div>
          <InputNumber
            value={profitLoss.todayProfit}
            style={{ width: '100%' }}
            placeholder="输入金额"
            prefix="￥"
            onChange={(v) => setProfitLoss({ todayProfit: v })}
          />
          {profitLoss.todayProfit !== null && (
            <Statistic
              value={profitLoss.todayProfit}
              precision={2}
              valueStyle={{ color: getProfitColor(profitLoss.todayProfit), fontSize: 16 }}
              prefix={getProfitIcon(profitLoss.todayProfit)}
              suffix="元"
              style={{ marginTop: 8 }}
            />
          )}
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>今日盈亏比例</div>
          <InputNumber
            value={profitLoss.todayProfitRate}
            style={{ width: '100%' }}
            placeholder="输入百分比"
            suffix="%"
            onChange={(v) => setProfitLoss({ todayProfitRate: v })}
          />
          {profitLoss.todayProfitRate !== null && (
            <Statistic
              value={profitLoss.todayProfitRate}
              precision={2}
              valueStyle={{ color: getProfitColor(profitLoss.todayProfitRate), fontSize: 16 }}
              prefix={getProfitIcon(profitLoss.todayProfitRate)}
              suffix="%"
              style={{ marginTop: 8 }}
            />
          )}
        </Col>
        <Col xs={24} sm={8}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>总资产（可选）</div>
          <InputNumber
            value={profitLoss.totalAssets}
            style={{ width: '100%' }}
            placeholder="输入总资产"
            prefix="￥"
            min={0}
            onChange={(v) => setProfitLoss({ totalAssets: v })}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default ProfitLossCard
