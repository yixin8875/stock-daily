import React, { useState } from 'react'
import { Card, Form, InputNumber, Button, Row, Col, Statistic, Alert } from 'antd'
import type { FormInstance } from 'antd'
import { FundOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'

interface DipResult {
  totalInvested: number
  finalValue: number
  totalShares: number
  avgCost: number
  profit: number
  profitRate: number
  annualizedReturn: number
  monthlyData: { month: number; invested: number; value: number; shares: number }[]
}

// 定投表单
const DipForm: React.FC<{
  form: FormInstance
  onFinish: (values: { monthlyAmount: number; months: number; expectedReturn: number; volatility: number }) => void
}> = ({ form, onFinish }) => (
  <Form form={form} layout="inline" onFinish={onFinish} style={{ marginBottom: 16 }}>
    <Form.Item name="monthlyAmount" label="每月定投" rules={[{ required: true }]} initialValue={1000}>
      <InputNumber min={100} style={{ width: 100 }} addonAfter="元" />
    </Form.Item>
    <Form.Item name="months" label="定投期限" rules={[{ required: true }]} initialValue={36}>
      <InputNumber min={1} max={360} style={{ width: 80 }} addonAfter="月" />
    </Form.Item>
    <Form.Item name="expectedReturn" label="预期年化" rules={[{ required: true }]} initialValue={8}>
      <InputNumber min={-50} max={100} style={{ width: 80 }} addonAfter="%" />
    </Form.Item>
    <Form.Item name="volatility" label="波动率" rules={[{ required: true }]} initialValue={20}>
      <InputNumber min={0} max={100} style={{ width: 80 }} addonAfter="%" />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit">模拟计算</Button>
    </Form.Item>
  </Form>
)

// 定投结果展示
const DipResultDisplay: React.FC<{ result: DipResult }> = ({ result }) => {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['累计投入', '账户市值'] },
    xAxis: { type: 'category', data: result.monthlyData.map(d => `第${d.month}月`) },
    yAxis: { type: 'value' },
    series: [
      { name: '累计投入', type: 'line', data: result.monthlyData.map(d => d.invested.toFixed(0)) },
      { name: '账户市值', type: 'line', data: result.monthlyData.map(d => d.value.toFixed(0)), areaStyle: { opacity: 0.3 } },
    ],
  }

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Statistic title="累计投入" value={result.totalInvested} precision={0} prefix="¥" /></Col>
        <Col span={4}><Statistic title="最终市值" value={result.finalValue} precision={0} prefix="¥" /></Col>
        <Col span={4}><Statistic title="总收益" value={result.profit} precision={0} prefix="¥" valueStyle={{ color: result.profit >= 0 ? '#52C41A' : '#FF4D4F' }} /></Col>
        <Col span={4}><Statistic title="收益率" value={result.profitRate} precision={2} suffix="%" valueStyle={{ color: result.profitRate >= 0 ? '#52C41A' : '#FF4D4F' }} /></Col>
        <Col span={4}><Statistic title="年化收益" value={result.annualizedReturn} precision={2} suffix="%" /></Col>
        <Col span={4}><Statistic title="平均成本" value={result.avgCost} precision={2} /></Col>
      </Row>
      <ReactECharts option={option} style={{ height: 300 }} />
    </>
  )
}

const DipCalculator: React.FC = () => {
  const [form] = Form.useForm()
  const [result, setResult] = useState<DipResult | null>(null)

  const handleCalculate = (values: {
    monthlyAmount: number
    months: number
    expectedReturn: number
    volatility: number
  }) => {
    const { monthlyAmount, months, expectedReturn, volatility } = values
    const monthlyReturn = expectedReturn / 100 / 12
    const monthlyVol = volatility / 100 / Math.sqrt(12)

    let totalShares = 0
    let totalInvested = 0
    let currentPrice = 100
    const monthlyData: DipResult['monthlyData'] = []

    for (let i = 1; i <= months; i++) {
      const randomReturn = monthlyReturn + (Math.random() - 0.5) * 2 * monthlyVol
      currentPrice = currentPrice * (1 + randomReturn)
      const shares = monthlyAmount / currentPrice
      totalShares += shares
      totalInvested += monthlyAmount

      monthlyData.push({
        month: i,
        invested: totalInvested,
        value: totalShares * currentPrice,
        shares: totalShares,
      })
    }

    const finalValue = totalShares * currentPrice
    const profit = finalValue - totalInvested
    const profitRate = (profit / totalInvested) * 100
    const annualizedReturn = (Math.pow(finalValue / totalInvested, 12 / months) - 1) * 100

    setResult({
      totalInvested,
      finalValue,
      totalShares,
      avgCost: totalInvested / totalShares,
      profit,
      profitRate,
      annualizedReturn,
      monthlyData,
    })
  }

  return (
    <Card title={<><FundOutlined style={{ marginRight: 8 }} />定投计算器</>}>
      <Alert
        type="info"
        message="定投策略"
        description="定期定额投资，通过时间分散降低择时风险，适合长期投资"
        style={{ marginBottom: 16 }}
      />
      <DipForm form={form} onFinish={handleCalculate} />
      {result && <DipResultDisplay result={result} />}
    </Card>
  )
}

export default DipCalculator
