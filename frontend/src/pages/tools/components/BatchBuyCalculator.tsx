import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Table, Row, Col, Statistic } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';

interface BatchResult {
  batch: number;
  price: number;
  amount: number;
  shares: number;
  cumAmount: number;
  cumShares: number;
  avgCost: number;
}

const BatchBuyCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState<BatchResult[]>([]);

  const handleCalculate = (values: any) => {
    const { totalAmount, batches, strategy, highPrice, lowPrice } = values;
    const newResults: BatchResult[] = [];

    // 计算每批金额
    const amounts: number[] = [];
    if (strategy === 'equal') {
      const each = totalAmount / batches;
      for (let i = 0; i < batches; i++) amounts.push(each);
    } else if (strategy === 'pyramid') {
      let sum = 0;
      for (let i = 1; i <= batches; i++) sum += i;
      for (let i = 1; i <= batches; i++) amounts.push((totalAmount * i) / sum);
    } else {
      let sum = 0;
      for (let i = 1; i <= batches; i++) sum += i;
      for (let i = batches; i >= 1; i--) amounts.push((totalAmount * i) / sum);
    }

    // 计算每批价格
    const step = (highPrice - lowPrice) / (batches - 1 || 1);
    let cumAmount = 0;
    let cumShares = 0;

    for (let i = 0; i < batches; i++) {
      const price = highPrice - step * i;
      const shares = Math.floor(amounts[i] / price / 100) * 100;
      const actualAmount = shares * price;
      cumAmount += actualAmount;
      cumShares += shares;

      newResults.push({
        batch: i + 1,
        price: Math.round(price * 100) / 100,
        amount: Math.round(actualAmount),
        shares,
        cumAmount: Math.round(cumAmount),
        cumShares,
        avgCost: Math.round((cumAmount / cumShares) * 100) / 100,
      });
    }

    setResults(newResults);
  };

  const columns = [
    { title: '批次', dataIndex: 'batch', key: 'batch' },
    { title: '买入价', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v}` },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '股数', dataIndex: 'shares', key: 'shares' },
    { title: '累计金额', dataIndex: 'cumAmount', key: 'cumAmount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '累计股数', dataIndex: 'cumShares', key: 'cumShares' },
    { title: '平均成本', dataIndex: 'avgCost', key: 'avgCost', render: (v: number) => `¥${v}` },
  ];

  return (
    <Card title={<><CalculatorOutlined /> 分批建仓计算器</>}>
      <Form form={form} layout="vertical" onFinish={handleCalculate}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="totalAmount" label="总投入金额" initialValue={100000}>
              <InputNumber min={1000} step={1000} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="batches" label="分批次数" initialValue={5}>
              <InputNumber min={2} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="strategy" label="建仓策略" initialValue="pyramid">
              <Select>
                <Select.Option value="equal">等量建仓</Select.Option>
                <Select.Option value="pyramid">金字塔建仓</Select.Option>
                <Select.Option value="reverse">倒金字塔建仓</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="highPrice" label="起始价格（高）" initialValue={20}>
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lowPrice" label="目标价格（低）" initialValue={15}>
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">计算建仓计划</Button>
        </Form.Item>
      </Form>

      {results.length > 0 && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic title="总投入" value={results[results.length - 1].cumAmount} prefix="¥" />
            </Col>
            <Col span={8}>
              <Statistic title="总股数" value={results[results.length - 1].cumShares} />
            </Col>
            <Col span={8}>
              <Statistic title="平均成本" value={results[results.length - 1].avgCost} prefix="¥" />
            </Col>
          </Row>
          <Table columns={columns} dataSource={results} rowKey="batch" size="small" pagination={false} />
        </>
      )}
    </Card>
  );
};

export default BatchBuyCalculator;
