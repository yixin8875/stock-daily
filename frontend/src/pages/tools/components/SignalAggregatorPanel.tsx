import React, { useState } from 'react';
import { Card, Input, Button, Progress, Tag, List, Space, Row, Col } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

interface SignalSource {
  name: string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number;
  reason: string;
}

interface AggregatedSignal {
  stockCode: string;
  stockName: string;
  overallSignal: string;
  score: number;
  sources: SignalSource[];
  suggestion: string;
}

const SignalAggregatorPanel: React.FC = () => {
  const [stockCode, setStockCode] = useState('');
  const [result, setResult] = useState<AggregatedSignal | null>({
    stockCode: '600519',
    stockName: '贵州茅台',
    overallSignal: 'buy',
    score: 45,
    sources: [
      { name: '均线', signal: 'buy', strength: 80, reason: '多头排列' },
      { name: 'RSI', signal: 'neutral', strength: 30, reason: 'RSI=55中性' },
      { name: 'MACD', signal: 'buy', strength: 60, reason: '金叉向上' },
      { name: '成交量', signal: 'buy', strength: 70, reason: '放量上涨' },
      { name: 'KD', signal: 'neutral', strength: 25, reason: 'KD中性' },
    ],
    suggestion: '技术面偏多，可适量参与',
  });

  const getSignalColor = (signal: string) => {
    if (signal === 'buy' || signal === 'strong_buy') return 'green';
    if (signal === 'sell' || signal === 'strong_sell') return 'red';
    return 'default';
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return '#52c41a';
    if (score >= 20) return '#73d13d';
    if (score > -20) return '#faad14';
    if (score > -60) return '#ff7a45';
    return '#f5222d';
  };

  return (
    <Card title={<><ThunderboltOutlined /> 交易信号聚合</>} size="small">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="输入股票代码"
          value={stockCode}
          onChange={e => setStockCode(e.target.value)}
          style={{ width: 120 }}
        />
        <Button type="primary">分析</Button>
      </Space>

      {result && (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#999' }}>综合得分</div>
                <Progress
                  type="dashboard"
                  percent={Math.abs(result.score)}
                  size={80}
                  strokeColor={getScoreColor(result.score)}
                  format={() => result.score}
                />
              </div>
            </Col>
            <Col span={16}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ marginRight: 8 }}>{result.stockName}</span>
                <Tag color={getSignalColor(result.overallSignal)}>
                  {result.overallSignal === 'strong_buy' ? '强烈买入' :
                   result.overallSignal === 'buy' ? '买入' :
                   result.overallSignal === 'neutral' ? '中性' :
                   result.overallSignal === 'sell' ? '卖出' : '强烈卖出'}
                </Tag>
              </div>
              <div style={{ color: '#666' }}>{result.suggestion}</div>
            </Col>
          </Row>

          <List
            size="small"
            dataSource={result.sources}
            renderItem={item => (
              <List.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>{item.name}</span>
                  <Tag color={getSignalColor(item.signal)}>
                    {item.signal === 'buy' ? '看多' : item.signal === 'sell' ? '看空' : '中性'}
                  </Tag>
                  <Progress percent={item.strength} size="small" style={{ width: 80 }} />
                  <span style={{ color: '#999', fontSize: 12 }}>{item.reason}</span>
                </Space>
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  );
};

export default SignalAggregatorPanel;
