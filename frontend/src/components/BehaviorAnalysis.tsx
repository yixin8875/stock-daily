import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Progress, Spin, Alert } from 'antd';
import ReactECharts from 'echarts-for-react';
import { request } from '../services';

interface WeekdayData {
  day: string;
  count: number;
  winRate: number;
}

interface TradingPattern {
  weekdayDistribution: WeekdayData[];
  tradingFrequency: {
    avgTradesPerWeek: number;
    avgTradesPerMonth: number;
    mostActiveDay: string;
    leastActiveDay: string;
  };
}

interface BehaviorBias {
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  evidence: string;
  suggestion: string;
}

interface TradingHabit {
  category: string;
  metric: string;
  value: number;
  benchmark: number;
  status: 'good' | 'warning' | 'danger';
  comment: string;
}

const BehaviorAnalysis: React.FC = () => {
  const [patterns, setPatterns] = useState<TradingPattern | null>(null);
  const [biases, setBiases] = useState<BehaviorBias[]>([]);
  const [habits, setHabits] = useState<TradingHabit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, bRes, hRes] = await Promise.all([
        request.get('/behavior/patterns'),
        request.get('/behavior/biases'),
        request.get('/behavior/habits'),
      ]);
      if (pRes.data.success) setPatterns(pRes.data.data);
      if (bRes.data.success) setBiases(bRes.data.data);
      if (hRes.data.success) setHabits(hRes.data.data);
    } catch (e) {
      console.error('获取数据失败:', e);
    }
    setLoading(false);
  };

  const getSeverityColor = (s: string) => {
    const colors: Record<string, string> = { high: 'red', medium: 'orange', low: 'blue' };
    return colors[s] || 'default';
  };

  const getStatusColor = (s: string) => {
    const colors: Record<string, string> = { good: 'green', warning: 'orange', danger: 'red' };
    return colors[s] || 'default';
  };

  const getWeekdayOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['交易次数', '胜率'] },
    xAxis: { type: 'category', data: patterns?.weekdayDistribution.map(d => d.day) || [] },
    yAxis: [
      { type: 'value', name: '次数' },
      { type: 'value', name: '胜率%', max: 100 },
    ],
    series: [
      {
        name: '交易次数',
        type: 'bar',
        data: patterns?.weekdayDistribution.map(d => d.count) || [],
      },
      {
        name: '胜率',
        type: 'line',
        yAxisIndex: 1,
        data: patterns?.weekdayDistribution.map(d => d.winRate) || [],
      },
    ],
  });

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>交易行为分析</h2>

      {patterns && (
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <Card title="交易时间分布">
              <ReactECharts option={getWeekdayOption()} style={{ height: 300 }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title="交易频率">
              <p>周均交易: {patterns.tradingFrequency.avgTradesPerWeek} 次</p>
              <p>月均交易: {patterns.tradingFrequency.avgTradesPerMonth} 次</p>
              <p>最活跃: {patterns.tradingFrequency.mostActiveDay}</p>
              <p>最不活跃: {patterns.tradingFrequency.leastActiveDay}</p>
            </Card>
          </Col>
        </Row>
      )}

      {biases.length > 0 && (
        <Card title="行为偏差检测" style={{ marginTop: 16 }}>
          {biases.map((b, i) => (
            <Alert
              key={i}
              type={b.severity === 'high' ? 'error' : 'warning'}
              message={<><Tag color={getSeverityColor(b.severity)}>{b.name}</Tag> {b.description}</>}
              description={<><p>证据: {b.evidence}</p><p>建议: {b.suggestion}</p></>}
              style={{ marginBottom: 8 }}
            />
          ))}
        </Card>
      )}

      {habits.length > 0 && (
        <Card title="交易习惯评估" style={{ marginTop: 16 }}>
          <Table
            dataSource={habits}
            rowKey="metric"
            columns={[
              { title: '类别', dataIndex: 'category' },
              { title: '指标', dataIndex: 'metric' },
              { title: '当前值', dataIndex: 'value' },
              { title: '基准值', dataIndex: 'benchmark' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={getStatusColor(s)}>{s}</Tag> },
              { title: '评价', dataIndex: 'comment' },
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default BehaviorAnalysis;
