import React, { useState } from 'react'
import { Card, Form, InputNumber, Button, Row, Col, Statistic, Typography, Alert } from 'antd'
import { SafetyOutlined } from '@ant-design/icons'
import { alertService, type StopLossAdvice } from '@/services'
import { StockSearch } from '@/components'

const { Text } = Typography

const SmartStopLoss: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<StopLossAdvice | null>(null)
  const [stockCode, setStockCode] = useState('')
  const [stockName, setStockName] = useState('')

  const handleCalculate = async (values: { entryPrice: number }) => {
    if (!stockCode) return
    setLoading(true)
    try {
      const res = await alertService.getStopLossAdvice(stockCode, values.entryPrice)
      setAdvice(res.data.data || null)
    } catch {
      setAdvice(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title={<><SafetyOutlined style={{ marginRight: 8 }} />智能止盈止损</>}
      style={{ marginBottom: 16 }}
    >
      <Form layout="inline" onFinish={handleCalculate} style={{ marginBottom: 16 }}>
        <Form.Item label="股票" style={{ width: 200 }}>
          <StockSearch
            onChange={(code, name) => { setStockCode(code); setStockName(name) }}
          />
        </Form.Item>
        <Form.Item name="entryPrice" label="买入价" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: 120 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>计算建议</Button>
        </Form.Item>
      </Form>

      {advice && <StopLossResult advice={advice} stockName={stockName} />}
    </Card>
  )
}

// 结果展示组件
const StopLossResult: React.FC<{ advice: StopLossAdvice; stockName: string }> = ({ advice, stockName }) => (
  <div>
    <Alert
      type="info"
      message={`${stockName} (${advice.stockCode}) 止盈止损建议`}
      description={`基于ATR波动率分析，当前波动率: ${(advice.volatility * 100).toFixed(2)}%`}
      style={{ marginBottom: 16 }}
    />
    <Row gutter={16}>
      <Col span={6}>
        <Statistic
          title="建议止损价"
          value={advice.suggestedStopLoss}
          precision={2}
          prefix="¥"
          valueStyle={{ color: '#10B981' }}
        />
        <Text type="secondary">-{advice.stopLossPercent.toFixed(1)}%</Text>
      </Col>
      <Col span={6}>
        <Statistic
          title="建议止盈价"
          value={advice.suggestedTakeProfit}
          precision={2}
          prefix="¥"
          valueStyle={{ color: '#EF4444' }}
        />
        <Text type="secondary">+{advice.takeProfitPercent.toFixed(1)}%</Text>
      </Col>
      <Col span={6}>
        <Statistic
          title="风险收益比"
          value={advice.riskRewardRatio}
          precision={2}
          suffix=":1"
          valueStyle={{ color: advice.riskRewardRatio >= 2 ? '#52C41A' : '#FF4D4F' }}
        />
      </Col>
      <Col span={6}>
        <Statistic title="ATR值" value={advice.atr} precision={2} />
      </Col>
    </Row>
  </div>
)

export default SmartStopLoss
