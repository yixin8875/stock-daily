import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface BehaviorMetrics {
  avgHoldDays: number;
  tradeFrequency: number;
  winRate: number;
  profitLossRatio: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  overtradingScore: number;
}

const BehaviorAnalysisPanel: React.FC = () => {
  const [metrics] = useState<BehaviorMetrics>({
    avgHoldDays: 5.2,
    tradeFrequency: 3.5,
    winRate: 58,
    profitLossRatio: 1.8,
    maxConsecutiveWins: 5,
    maxConsecutiveLosses: 3,
    overtradingScore: 35,
  });

  const habits = [
    { habit: '追涨杀跌', count: 12, impact: -2500, level: 'high' },
    { habit: '频繁交易', count: 8, impact: -1200, level: 'medium' },
    { habit: '止损不及时', count: 5, impact: -3000, level: 'high' },
    { habit: '持仓过重', count: 3, impact: -800, level: 'low' },
  ];

  const columns = [
    { title: '不良习惯', dataIndex: 'habit', key: 'habit' },
    { title: '发生次数', dataIndex: 'count', key: 'count' },
    {
      title: '影响金额',
      dataIndex: 'impact',
      key: 'impact',
      render: (v: number) => (
        <span style={{ color: '#cf1322' }}>¥{v.toLocaleString()}</span>
      ),
    },
    {
      title: '严重程度',
      dataIndex: 'level',
      key: 'level',
      render: (v: string) => (
        <Tag color={v === 'high' ? 'red' : v === 'medium' ? 'orange' : 'green'}>
          {v === 'high' ? '严重' : v === 'medium' ? '中等' : '轻微'}
        </Tag>
      ),
    },
  ];

  return (
    <Card title={<><UserOutlined /> 交易行为分析</>}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Statistic title="平均持仓天数" value={metrics.avgHoldDays} suffix="天" />
        </Col>
        <Col span={6}>
          <Statistic title="周交易频率" value={metrics.tradeFrequency} suffix="次" />
        </Col>
        <Col span={6}>
          <Statistic title="胜率" value={metrics.winRate} suffix="%" />
        </Col>
        <Col span={6}>
          <Statistic title="盈亏比" value={metrics.profitLossRatio} />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card size="small" title="过度交易指数">
            <Progress
              percent={metrics.overtradingScore}
              status={metrics.overtradingScore > 60 ? 'exception' : 'normal'}
              format={(p) => `${p}%`}
            />
            <div style={{ marginTop: 8, color: '#666' }}>
              {metrics.overtradingScore > 60 ? '交易过于频繁，建议减少操作' : '交易频率正常'}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="连续交易记录">
            <Row>
              <Col span={12}>
                <Statistic
                  title="最大连胜"
                  value={metrics.maxConsecutiveWins}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="最大连亏"
                  value={metrics.maxConsecutiveLosses}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="不良交易习惯">
        <Table columns={columns} dataSource={habits} rowKey="habit" size="small" pagination={false} />
      </Card>
    </Card>
  );
};

export default BehaviorAnalysisPanel;
