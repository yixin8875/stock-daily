import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Tag, List } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface Pattern {
  name: string;
  description: string;
  score: number;
}

const TradeHabitPanel: React.FC = () => {
  const [habits] = useState({
    preferredTime: '尾盘',
    preferredWeekday: '周一',
    avgHoldingDays: 5,
    tradeFrequency: 12,
    winRate: 58,
    avgProfitRate: 2.3,
    patterns: [
      { name: '追涨倾向', description: '买入时机偏向上涨股票', score: 60 },
      { name: '频繁交易', description: '月均交易次数较高', score: 50 },
    ] as Pattern[],
  });

  return (
    <Card title={<><UserOutlined /> 交易习惯分析</>} size="small">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="偏好时段" value={habits.preferredTime} />
        </Col>
        <Col span={8}>
          <Statistic title="偏好星期" value={habits.preferredWeekday} />
        </Col>
        <Col span={8}>
          <Statistic title="平均持仓天数" value={habits.avgHoldingDays} suffix="天" />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="月均交易" value={habits.tradeFrequency} suffix="笔" />
        </Col>
        <Col span={8}>
          <Statistic title="胜率" value={habits.winRate} suffix="%" />
        </Col>
        <Col span={8}>
          <Statistic title="平均收益" value={habits.avgProfitRate} suffix="%" />
        </Col>
      </Row>

      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>行为模式识别</div>
      <List
        size="small"
        dataSource={habits.patterns}
        renderItem={item => (
          <List.Item>
            <Tag color={item.score >= 60 ? 'orange' : 'blue'}>{item.name}</Tag>
            <span style={{ color: '#666' }}>{item.description}</span>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TradeHabitPanel;
