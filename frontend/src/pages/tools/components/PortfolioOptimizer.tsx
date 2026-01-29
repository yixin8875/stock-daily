import React, { useState } from 'react';
import { Card, Form, Input, Button, Table, Row, Col, Statistic, Tag } from 'antd';
import { FundOutlined } from '@ant-design/icons';

interface WeightResult {
  stockCode: string;
  weight: number;
}

interface OptResult {
  weights: WeightResult[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
}

const PortfolioOptimizer: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<OptResult | null>(null);

  const handleOptimize = (values: any) => {
    const codes = values.stockCodes.split(',').map((s: string) => s.trim());

    // 模拟优化结果
    const totalWeight = codes.length;
    const weights: WeightResult[] = codes.map((code: string, i: number) => ({
      stockCode: code,
      weight: Math.round((100 / totalWeight) * (1 + (Math.random() - 0.5) * 0.5) * 100) / 100,
    }));

    // 归一化
    const sum = weights.reduce((s, w) => s + w.weight, 0);
    weights.forEach(w => w.weight = Math.round((w.weight / sum) * 10000) / 100);

    setResult({
      weights,
      expectedReturn: Math.round((8 + Math.random() * 10) * 100) / 100,
      volatility: Math.round((15 + Math.random() * 10) * 100) / 100,
      sharpeRatio: Math.round((0.5 + Math.random() * 0.8) * 100) / 100,
    });
  };

  const columns = [
    { title: '股票代码', dataIndex: 'stockCode', key: 'stockCode' },
    {
      title: '建议权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (v: number) => (
        <Tag color={v > 25 ? 'blue' : 'default'}>{v}%</Tag>
      ),
    },
  ];

  return (
    <Card title={<><FundOutlined /> 组合优化器</>}>
      <Form form={form} layout="vertical" onFinish={handleOptimize}>
        <Form.Item
          name="stockCodes"
          label="股票代码（逗号分隔）"
          initialValue="000001,600519,000858"
        >
          <Input placeholder="如：000001,600519,000858" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            优化组合
          </Button>
        </Form.Item>
      </Form>

      {result && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="预期年化收益"
                value={result.expectedReturn}
                suffix="%"
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
            <Col span={8}>
              <Statistic title="年化波动率" value={result.volatility} suffix="%" />
            </Col>
            <Col span={8}>
              <Statistic title="夏普比率" value={result.sharpeRatio} />
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={result.weights}
            rowKey="stockCode"
            size="small"
            pagination={false}
          />
        </>
      )}
    </Card>
  );
};

export default PortfolioOptimizer;
