import React, { useState } from 'react'
import { Card, Form, InputNumber, Button, Row, Col, Statistic, Alert } from 'antd'
import { CalculatorOutlined } from '@ant-design/icons'
import { alertService, type PositionAdvice } from '@/services'
import { StockSearch } from '@/components'

const PositionSizer: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<PositionAdvice | null>(null)
  const [stockCode, setStockCode] = useState('')
  const [stockName, setStockName] = useState('')

  const handleCalculate = async (values: { totalCapital: number; stopLossPrice: number }) => {
    if (!stockCode) return
    setLoading(true)
    try {
      const res = await alertService.getPositionAdvice(stockCode, values.totalCapital, values.stopLossPrice)
      setAdvice(res.data.data || null)
    } catch {
      setAdvice(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title={<><CalculatorOutlined style={{ marginRight: 8 }} />仓位建议</>}
      style={{ marginBottom: 16 }}
    >
      <Form layout="inline" onFinish={handleCalculate} style={{ marginBottom: 16 }}>
        <Form.Item label="股票" style={{ width: 200 }}>
          <StockSearch onChange={(code, name) => { setStockCode(code); setStockName(name) }} />
        </Form.Item>
        <Form.Item name="totalCapital" label="总资金" rules={[{ required: true }]}>
          <InputNumber min={0} precision={0} style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="stopLossPrice" label="止损价" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: 100 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>计算</Button>
        </Form.Item>
      </Form>

      {advice && <PositionResult advice={advice} stockName={stockName} />}
    </Card>
  )
}

// 结果展示组件
const PositionResult: React.FC<{ advice: PositionAdvice; stockName: string }> = ({ advice, stockName }) => (
  <div>
    <Alert
      type="info"
      message={`${stockName} 仓位建议`}
      description={`基于凯利公式计算，历史胜率: ${(advice.winRate * 100).toFixed(1)}%`}
      style={{ marginBottom: 16 }}
    />
    <Row gutter={16}>
      <Col span={6}>
        <Statistic
          title="凯利仓位"
          value={advice.kellyPercent}
          precision={1}
          suffix="%"
          valueStyle={{ color: '#1890FF' }}
        />
      </Col>
      <Col span={6}>
        <Statistic
          title="建议仓位(半凯利)"
          value={advice.halfKellyPercent}
          precision={1}
          suffix="%"
          valueStyle={{ color: '#52C41A' }}
        />
      </Col>
      <Col span={6}>
        <Statistic
          title="建议买入"
          value={advice.suggestedShares}
          suffix="股"
        />
      </Col>
      <Col span={6}>
        <Statistic
          title="建议金额"
          value={advice.suggestedAmount}
          precision={0}
          prefix="¥"
        />
      </Col>
    </Row>
  </div>
)

export default PositionSizer
