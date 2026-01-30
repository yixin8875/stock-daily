import React, { useState } from 'react';
import { Card, Timeline, Statistic, Row, Col } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

interface Snapshot {
  date: string;
  totalValue: number;
  change: number;
}

const PositionHistoryPanel: React.FC = () => {
  const [snapshots] = useState<Snapshot[]>([
    { date: '2025-01-25', totalValue: 258000, change: 2.5 },
    { date: '2025-01-24', totalValue: 251700, change: -1.2 },
    { date: '2025-01-23', totalValue: 254800, change: 1.8 },
  ]);

  return (
    <Card title={<><HistoryOutlined /> 持仓变化</>} size="small">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic title="当前市值" value={snapshots[0]?.totalValue} prefix="¥" />
        </Col>
        <Col span={12}>
          <Statistic
            title="今日变化"
            value={snapshots[0]?.change}
            suffix="%"
            valueStyle={{ color: snapshots[0]?.change >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
      </Row>
      <Timeline
        items={snapshots.map(s => ({
          color: s.change >= 0 ? 'green' : 'red',
          children: `${s.date}: ¥${s.totalValue.toLocaleString()} (${s.change >= 0 ? '+' : ''}${s.change}%)`,
        }))}
      />
    </Card>
  );
};

export default PositionHistoryPanel;
