import React, { useState } from 'react';
import { Card, Progress, Row, Col, Tag } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';

const MarketSentimentIndex: React.FC = () => {
  const [sentiment] = useState({
    overall: 62,
    level: 'greed',
    components: [
      { name: '涨跌比', value: 58 },
      { name: '成交量', value: 65 },
      { name: '北向资金', value: 70 },
    ],
  });

  const levelMap: Record<string, { color: string; text: string }> = {
    extreme_greed: { color: '#cf1322', text: '极度贪婪' },
    greed: { color: '#fa8c16', text: '贪婪' },
    neutral: { color: '#1890ff', text: '中性' },
    fear: { color: '#52c41a', text: '恐惧' },
    extreme_fear: { color: '#389e0d', text: '极度恐惧' },
  };

  const info = levelMap[sentiment.level] || levelMap.neutral;

  return (
    <Card title={<><DashboardOutlined /> 市场情绪指数</>} size="small">
      <Row gutter={16}>
        <Col span={8}>
          <Progress
            type="dashboard"
            percent={sentiment.overall}
            format={(p) => `${p}`}
            strokeColor={info.color}
          />
          <div style={{ textAlign: 'center' }}>
            <Tag color={info.color}>{info.text}</Tag>
          </div>
        </Col>
        <Col span={16}>
          {sentiment.components.map((c) => (
            <div key={c.name} style={{ marginBottom: 12 }}>
              <span>{c.name}</span>
              <Progress percent={c.value} size="small" />
            </div>
          ))}
        </Col>
      </Row>
    </Card>
  );
};

export default MarketSentimentIndex;
