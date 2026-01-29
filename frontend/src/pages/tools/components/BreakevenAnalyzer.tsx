import React, { useState } from 'react';
import { Card, Form, InputNumber, Button, Row, Col, Statistic, List, Tag } from 'antd';
import { FallOutlined, RiseOutlined } from '@ant-design/icons';

interface Scenario {
  method: string;
  description: string;
  action: string;
  newAvgCost: number;
  requiredGain: number;
}

const BreakevenAnalyzer: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<{
    lossAmount: number;
    lossPercent: number;
    requiredGain: number;
    scenarios: Scenario[];
  } | null>(null);

  const handleAnalyze = (values: any) => {
    const { costPrice, currentPrice, shares } = values;
    const lossAmount = (costPrice - currentPrice) * shares;
    const lossPercent = ((costPrice - currentPrice) / costPrice) * 100;
    const requiredGain = ((costPrice - currentPrice) / currentPrice) * 100;

    const scenarios: Scenario[] = [];

    // 方案1：持股等待
    scenarios.push({
      method: 'hold',
      description: '持股等待解套',
      action: `等待股价从${currentPrice}涨到${costPrice}`,
      newAvgCost: costPrice,
      requiredGain: Math.round(requiredGain * 100) / 100,
    });

    // 方案2：补仓摊薄
    const addShares = shares;
    const totalCost = costPrice * shares + currentPrice * addShares;
    const totalShares = shares + addShares;
    const newAvgCost = totalCost / totalShares;

    scenarios.push({
      method: 'add',
      description: '等量补仓摊薄成本',
      action: `在${currentPrice}补仓${addShares}股`,
      newAvgCost: Math.round(newAvgCost * 100) / 100,
      requiredGain: Math.round(((newAvgCost - currentPrice) / currentPrice) * 10000) / 100,
    });

    // 方案3：T+0
    const tProfit = shares * currentPrice * 0.03;
    const tTimes = Math.ceil(lossAmount / tProfit);

    scenarios.push({
      method: 't0',
      description: 'T+0高抛低吸',
      action: `每次赚3%约${Math.round(tProfit)}元，需${tTimes}次`,
      newAvgCost: costPrice,
      requiredGain: 3,
    });

    // 方案4：止损换股
    scenarios.push({
      method: 'cut',
      description: '止损换股',
      action: '卖出后换入更强势股票',
      newAvgCost: currentPrice,
      requiredGain: 0,
    });

    setResult({
      lossAmount: Math.round(lossAmount * 100) / 100,
      lossPercent: Math.round(lossPercent * 100) / 100,
      requiredGain: Math.round(requiredGain * 100) / 100,
      scenarios,
    });
  };

  return (
    <Card title={<><FallOutlined /> 盈亏平衡分析</>}>
      <Form form={form} layout="vertical" onFinish={handleAnalyze}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="costPrice" label="成本价" initialValue={20}>
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="currentPrice" label="现价" initialValue={15}>
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="shares" label="持仓股数" initialValue={1000}>
              <InputNumber min={100} step={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">分析解套方案</Button>
        </Form.Item>
      </Form>

      {result && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="浮亏金额"
                value={result.lossAmount}
                prefix="¥"
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="浮亏比例"
                value={result.lossPercent}
                suffix="%"
                valueStyle={{ color: '#cf1322' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="解套所需涨幅"
                value={result.requiredGain}
                suffix="%"
                prefix={<RiseOutlined />}
              />
            </Col>
          </Row>

          <List
            header={<strong>解套方案</strong>}
            dataSource={result.scenarios}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <span>
                      {item.description}
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        需涨 {item.requiredGain}%
                      </Tag>
                    </span>
                  }
                  description={item.action}
                />
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  );
};

export default BreakevenAnalyzer;
