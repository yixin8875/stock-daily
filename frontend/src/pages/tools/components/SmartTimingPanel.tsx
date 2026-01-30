import React, { useState } from 'react';
import { Card, Form, Input, Button, Tag, Row, Col, Statistic } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

interface IndicatorStatus {
  name: string;
  signal: string;
}

const SmartTimingPanel: React.FC = () => {
  const [result, setResult] = useState<{
    action: string;
    confidence: number;
    indicators: IndicatorStatus[];
  } | null>(null);

  const handleAnalyze = () => {
    setResult({
      action: 'buy',
      confidence: 75,
      indicators: [
        { name: 'MA', signal: 'bullish' },
        { name: 'RSI', signal: 'neutral' },
        { name: 'MACD', signal: 'bullish' },
      ],
    });
  };

  const actionMap: Record<string, { color: string; text: string }> = {
    buy: { color: 'green', text: '买入' },
    sell: { color: 'red', text: '卖出' },
    hold: { color: 'blue', text: '观望' },
  };

  return (
    <Card title={<><ClockCircleOutlined /> 智能选时</>} size="small">
      <Form layout="inline" onFinish={handleAnalyze} style={{ marginBottom: 16 }}>
        <Form.Item name="stockCode" initialValue="000001">
          <Input placeholder="股票代码" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">分析</Button>
        </Form.Item>
      </Form>

      {result && (
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="建议操作"
              value={actionMap[result.action].text}
              valueStyle={{ color: actionMap[result.action].color }}
            />
          </Col>
          <Col span={8}>
            <Statistic title="置信度" value={result.confidence} suffix="%" />
          </Col>
          <Col span={8}>
            {result.indicators.map(i => (
              <Tag key={i.name} color={i.signal === 'bullish' ? 'green' : i.signal === 'bearish' ? 'red' : 'blue'}>
                {i.name}
              </Tag>
            ))}
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default SmartTimingPanel;
