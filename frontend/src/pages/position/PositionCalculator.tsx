import React, { useState } from 'react'
import { Card, Form, InputNumber, Typography, Statistic, Row, Col, Divider } from 'antd'

const { Title, Text } = Typography

const PositionCalculator: React.FC = () => {
  const [totalCapital, setTotalCapital] = useState<number>(100000)
  const [riskPercent, setRiskPercent] = useState<number>(2)
  const [entryPrice, setEntryPrice] = useState<number>(10)
  const [stopPrice, setStopPrice] = useState<number>(9)

  const riskAmount = totalCapital * (riskPercent / 100)
  const priceRisk = entryPrice - stopPrice
  const shares = priceRisk > 0 ? Math.floor(riskAmount / priceRisk / 100) * 100 : 0
  const positionValue = shares * entryPrice
  const positionPercent = totalCapital > 0 ? (positionValue / totalCapital) * 100 : 0
  const maxLoss = shares * priceRisk

  return (
    <Card>
      <Title level={4}>仓位计算器</Title>
      <Text type="secondary">根据风险控制计算合理仓位</Text>
      <Divider />
      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Form.Item label="总资金">
              <InputNumber
                value={totalCapital}
                onChange={v => setTotalCapital(v || 0)}
                min={0}
                style={{ width: '100%' }}
                formatter={v => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={v => Number(v?.replace(/¥\s?|(,*)/g, ''))}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item label="单笔风险 (%)">
              <InputNumber
                value={riskPercent}
                onChange={v => setRiskPercent(v || 0)}
                min={0}
                max={100}
                precision={1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item label="买入价">
              <InputNumber
                value={entryPrice}
                onChange={v => setEntryPrice(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Item label="止损价">
              <InputNumber
                value={stopPrice}
                onChange={v => setStopPrice(v || 0)}
                min={0}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider />

      <Row gutter={16}>
        <Col xs={12} sm={6}>
          <Statistic
            title="风险金额"
            value={riskAmount}
            precision={2}
            prefix="¥"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="建议买入"
            value={shares}
            suffix="股"
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="仓位金额"
            value={positionValue}
            precision={2}
            prefix="¥"
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="仓位占比"
            value={positionPercent}
            precision={1}
            suffix="%"
          />
        </Col>
      </Row>

      <Divider />

      <Row gutter={16}>
        <Col xs={12}>
          <Statistic
            title="单股风险"
            value={priceRisk}
            precision={2}
            prefix="¥"
            valueStyle={{ color: priceRisk > 0 ? '#10B981' : '#EF4444' }}
          />
        </Col>
        <Col xs={12}>
          <Statistic
            title="最大亏损"
            value={maxLoss}
            precision={2}
            prefix="¥"
            valueStyle={{ color: '#EF4444' }}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default PositionCalculator
