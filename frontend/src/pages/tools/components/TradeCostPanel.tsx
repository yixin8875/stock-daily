import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Row, Col, Statistic } from 'antd';
import { AccountBookOutlined } from '@ant-design/icons';

const TradeCostPanel: React.FC = () => {
  const [cost, setCost] = useState<{
    commission: number;
    stampTax: number;
    transferFee: number;
    total: number;
  } | null>(null);

  const handleCalc = (values: any) => {
    const { amount, direction } = values;
    const commission = Math.max(5, amount * 0.0003);
    const stampTax = direction === 'sell' ? amount * 0.001 : 0;
    const transferFee = amount * 0.00002;

    setCost({
      commission: Math.round(commission * 100) / 100,
      stampTax: Math.round(stampTax * 100) / 100,
      transferFee: Math.round(transferFee * 100) / 100,
      total: Math.round((commission + stampTax + transferFee) * 100) / 100,
    });
  };

  return (
    <Card title={<><AccountBookOutlined /> 交易成本计算</>} size="small">
      <Form layout="inline" onFinish={handleCalc} style={{ marginBottom: 16 }}>
        <Form.Item name="amount" initialValue={10000}>
          <InputNumber placeholder="交易金额" prefix="¥" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="direction" initialValue="buy">
          <Select style={{ width: 80 }}>
            <Select.Option value="buy">买入</Select.Option>
            <Select.Option value="sell">卖出</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">计算</Button>
        </Form.Item>
      </Form>

      {cost && (
        <Row gutter={16}>
          <Col span={6}><Statistic title="佣金" value={cost.commission} prefix="¥" /></Col>
          <Col span={6}><Statistic title="印花税" value={cost.stampTax} prefix="¥" /></Col>
          <Col span={6}><Statistic title="过户费" value={cost.transferFee} prefix="¥" /></Col>
          <Col span={6}><Statistic title="总成本" value={cost.total} prefix="¥" valueStyle={{ color: '#cf1322' }} /></Col>
        </Row>
      )}
    </Card>
  );
};

export default TradeCostPanel;
