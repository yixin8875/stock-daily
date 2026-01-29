import React, { useState } from 'react';
import { Card, Form, InputNumber, Button, Row, Col, Statistic, Tag, List } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';

interface PositionResult {
  kellyPercent: number;
  halfKellyPercent: number;
  fixedPercent: number;
  suggestedShares: number;
  maxLoss: number;
  riskRewardRatio: number;
}

const PositionManager: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<PositionResult | null>(null);
  const [pyramid, setPyramid] = useState<number[]>([]);

  const handleCalculate = (values: any) => {
    const { totalCapital, entryPrice, stopPrice, targetPrice, winRate } = values;

    const riskPerShare = entryPrice - stopPrice;
    const rewardPerShare = targetPrice - entryPrice;
    const riskRewardRatio = rewardPerShare / riskPerShare;

    // 凯利公式
    const kelly = winRate - (1 - winRate) / riskRewardRatio;
    const kellyPercent = Math.max(0, Math.min(kelly, 1));
    const halfKellyPercent = kellyPercent / 2;

    // 固定风险法
    const maxRiskAmount = totalCapital * 0.02;
    const fixedShares = Math.floor(maxRiskAmount / riskPerShare / 100) * 100;
    const fixedPercent = (fixedShares * entryPrice) / totalCapital;

    const suggestedShares = Math.floor((totalCapital * halfKellyPercent) / entryPrice / 100) * 100;
    const maxLoss = suggestedShares * riskPerShare;

    setResult({
      kellyPercent: Math.round(kellyPercent * 10000) / 100,
      halfKellyPercent: Math.round(halfKellyPercent * 10000) / 100,
      fixedPercent: Math.round(fixedPercent * 10000) / 100,
      suggestedShares,
      maxLoss: Math.round(maxLoss * 100) / 100,
      riskRewardRatio: Math.round(riskRewardRatio * 100) / 100,
    });

    // 金字塔加仓
    const positions: number[] = [];
    let remaining = suggestedShares;
    for (let i = 0; i < 3; i++) {
      const shares = Math.floor(remaining / (3 - i) / 100) * 100;
      positions.push(shares);
      remaining -= shares;
    }
    setPyramid(positions);
  };

  return (
    <Card title={<><PieChartOutlined /> 仓位管理器</>}>
      <Form form={form} layout="vertical" onFinish={handleCalculate}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="totalCapital" label="总资金" initialValue={100000}>
              <InputNumber min={1000} step={1000} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="entryPrice" label="买入价" initialValue={10}>
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="winRate" label="历史胜率" initialValue={0.5}>
              <InputNumber min={0} max={1} step={0.05} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="stopPrice" label="止损价" initialValue={9}>
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="targetPrice" label="目标价" initialValue={12}>
              <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">计算仓位</Button>
        </Form.Item>
      </Form>

      {result && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic title="凯利仓位" value={result.kellyPercent} suffix="%" />
            </Col>
            <Col span={6}>
              <Statistic title="半凯利仓位" value={result.halfKellyPercent} suffix="%"
                valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={6}>
              <Statistic title="建议股数" value={result.suggestedShares} />
            </Col>
            <Col span={6}>
              <Statistic title="盈亏比" value={result.riskRewardRatio} />
            </Col>
          </Row>

          <Card size="small" title="金字塔加仓建议">
            <List
              dataSource={pyramid.map((shares, i) => ({ level: i + 1, shares }))}
              renderItem={(item) => (
                <List.Item>
                  <Tag color="blue">第{item.level}批</Tag> {item.shares} 股
                </List.Item>
              )}
            />
          </Card>
        </>
      )}
    </Card>
  );
};

export default PositionManager;
