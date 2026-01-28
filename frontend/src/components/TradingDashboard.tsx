import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Spin, DatePicker } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { request } from '../services';

const { RangePicker } = DatePicker;

interface DashboardMetrics {
  totalTrades: number;
  winRate: number;
  profitLossRatio: number;
  netProfit: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  expectancy: number;
  sharpeRatio: number;
}

interface DrawdownPoint {
  date: string;
  equity: number;
  drawdown: number;
  drawdownPercent: number;
}

const TradingDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [drawdown, setDrawdown] = useState<DrawdownPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const [metricsRes, drawdownRes] = await Promise.all([
        request.get('/dashboard/metrics', { params }),
        request.get('/dashboard/drawdown', { params }),
      ]);

      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
      if (drawdownRes.data.success) setDrawdown(drawdownRes.data.data);
    } catch (e) {
      console.error('获取数据失败:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const getDrawdownOption = () => ({
    tooltip: { trigger: 'axis' },
    legend: { data: ['累计收益', '回撤'] },
    xAxis: { type: 'category', data: drawdown.map(d => d.date) },
    yAxis: [
      { type: 'value', name: '收益' },
      { type: 'value', name: '回撤%', inverse: true },
    ],
    series: [
      {
        name: '累计收益',
        type: 'line',
        data: drawdown.map(d => d.equity),
        smooth: true,
        areaStyle: { opacity: 0.3 },
      },
      {
        name: '回撤',
        type: 'line',
        yAxisIndex: 1,
        data: drawdown.map(d => d.drawdownPercent),
        smooth: true,
        lineStyle: { color: '#ff4d4f' },
        areaStyle: { color: '#ff4d4f', opacity: 0.2 },
      },
    ],
  });

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><h2 style={{ margin: 0 }}>交易统计仪表盘</h2></Col>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
        </Col>
      </Row>

      {metrics && (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <Statistic
                  title="总交易次数"
                  value={metrics.totalTrades}
                  suffix="次"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <Statistic
                  title="胜率"
                  value={metrics.winRate}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: metrics.winRate >= 50 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <Statistic
                  title="盈亏比"
                  value={metrics.profitLossRatio}
                  precision={2}
                  valueStyle={{ color: metrics.profitLossRatio >= 1.5 ? '#3f8600' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <Statistic
                  title="净收益"
                  value={metrics.netProfit}
                  precision={2}
                  prefix={metrics.netProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  valueStyle={{ color: metrics.netProfit >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <Statistic
                  title="最大回撤"
                  value={metrics.maxDrawdownPercent}
                  precision={2}
                  suffix="%"
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: metrics.maxDrawdownPercent > 20 ? '#cf1322' : '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <Statistic
                  title="期望值"
                  value={metrics.expectancy}
                  precision={2}
                  valueStyle={{ color: metrics.expectancy > 0 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <Statistic
                  title="夏普比率"
                  value={metrics.sharpeRatio}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card>
                <div style={{ marginBottom: 8 }}>连续记录</div>
                <Tag icon={<TrophyOutlined />} color="green">
                  最大连胜: {metrics.maxConsecutiveWins}
                </Tag>
                <Tag color="red" style={{ marginTop: 4 }}>
                  最大连亏: {metrics.maxConsecutiveLosses}
                </Tag>
              </Card>
            </Col>
          </Row>

          <Card title="收益与回撤曲线" style={{ marginTop: 16 }}>
            <ReactECharts option={getDrawdownOption()} style={{ height: 350 }} />
          </Card>
        </>
      )}
    </div>
  );
};

export default TradingDashboard;
