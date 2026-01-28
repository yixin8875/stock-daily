import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { stockApi } from '@/services';

interface MarketSentiment {
  date: string;
  advanceCount: number;
  declineCount: number;
  flatCount: number;
  limitUpCount: number;
  limitDownCount: number;
  averageChange: number;
  sentimentScore: number;
  sentimentLevel: string;
}

const SentimentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MarketSentiment | null>(null);
  const gaugeRef = React.useRef<HTMLDivElement>(null);
  const pieRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await stockApi.getMarketSentiment();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data || !gaugeRef.current) return;
    const chart = echarts.init(gaugeRef.current);
    const option = {
      series: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        itemStyle: {
          color: getScoreColor(data.sentimentScore),
        },
        progress: { show: true, width: 18 },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 18 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 28,
          offsetCenter: [0, '-10%'],
          formatter: '{value}',
          color: getScoreColor(data.sentimentScore),
        },
        data: [{ value: data.sentimentScore }],
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [data]);

  useEffect(() => {
    if (!data || !pieRef.current) return;
    const chart = echarts.init(pieRef.current);
    const option = {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        label: { show: false },
        data: [
          { value: data.advanceCount, name: '上涨', itemStyle: { color: '#EF4444' } },
          { value: data.declineCount, name: '下跌', itemStyle: { color: '#10B981' } },
          { value: data.flatCount, name: '平盘', itemStyle: { color: '#9CA3AF' } },
        ],
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [data]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#EF4444';
    if (score >= 60) return '#F97316';
    if (score >= 40) return '#9CA3AF';
    if (score >= 20) return '#22C55E';
    return '#10B981';
  };

  const getLevelText = (level: string) => {
    const map: Record<string, string> = {
      extreme_greed: '极度贪婪',
      greed: '贪婪',
      neutral: '中性',
      fear: '恐惧',
      extreme_fear: '极度恐惧',
    };
    return map[level] || level;
  };

  if (loading) return <Spin />;
  if (!data) return <div>暂无数据</div>;

  return (
    <Card title="市场情绪仪表盘" extra={<span>{data.date}</span>}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div ref={gaugeRef} style={{ height: 200 }} />
          <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 500 }}>
            {getLevelText(data.sentimentLevel)}
          </div>
        </Col>
        <Col span={12}>
          <div ref={pieRef} style={{ height: 220 }} />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Statistic
            title="涨停"
            value={data.limitUpCount}
            valueStyle={{ color: '#EF4444' }}
            prefix={<ArrowUpOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="跌停"
            value={data.limitDownCount}
            valueStyle={{ color: '#10B981' }}
            prefix={<ArrowDownOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="平均涨幅"
            value={data.averageChange}
            precision={2}
            suffix="%"
            valueStyle={{ color: data.averageChange >= 0 ? '#EF4444' : '#10B981' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="涨跌比"
            value={(data.advanceCount / (data.declineCount || 1)).toFixed(2)}
            prefix={data.advanceCount > data.declineCount ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default SentimentDashboard;
