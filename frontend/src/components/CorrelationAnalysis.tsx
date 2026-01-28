import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Progress, Spin, Alert } from 'antd';
import ReactECharts from 'echarts-for-react';
import { request } from '../services';

interface CorrelationPair {
  stock1: string;
  stock2: string;
  name1: string;
  name2: string;
  correlation: number;
  level: 'high' | 'medium' | 'low' | 'negative';
}

interface DiversificationScore {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  industryConcentration: number;
  topHoldingWeight: number;
  suggestions: string[];
}

const CorrelationAnalysis: React.FC = () => {
  const [correlations, setCorrelations] = useState<CorrelationPair[]>([]);
  const [diversification, setDiversification] = useState<DiversificationScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [corrRes, divRes] = await Promise.all([
        request.get('/correlation/correlations'),
        request.get('/correlation/diversification'),
      ]);
      if (corrRes.data.success) setCorrelations(corrRes.data.data);
      if (divRes.data.success) setDiversification(divRes.data.data);
    } catch (e) {
      console.error('获取数据失败:', e);
    }
    setLoading(false);
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      high: 'red', medium: 'orange', low: 'green', negative: 'blue',
    };
    return colors[level] || 'default';
  };

  const getLevelText = (level: string) => {
    const texts: Record<string, string> = {
      high: '高相关', medium: '中相关', low: '低相关', negative: '负相关',
    };
    return texts[level] || level;
  };

  const columns = [
    { title: '股票1', dataIndex: 'name1', key: 'name1' },
    { title: '股票2', dataIndex: 'name2', key: 'name2' },
    {
      title: '相关系数',
      dataIndex: 'correlation',
      key: 'correlation',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: '相关程度',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>{getLevelText(level)}</Tag>
      ),
    },
  ];

  const getHeatmapOption = () => {
    const stocks = [...new Set(correlations.flatMap(c => [c.name1, c.name2]))];
    const data: [number, number, number][] = [];

    stocks.forEach((s1, i) => {
      stocks.forEach((s2, j) => {
        if (i === j) {
          data.push([i, j, 1]);
        } else {
          const pair = correlations.find(
            c => (c.name1 === s1 && c.name2 === s2) || (c.name1 === s2 && c.name2 === s1)
          );
          data.push([i, j, pair?.correlation || 0]);
        }
      });
    });

    return {
      tooltip: { position: 'top' },
      xAxis: { type: 'category', data: stocks, axisLabel: { rotate: 45 } },
      yAxis: { type: 'category', data: stocks },
      visualMap: {
        min: -1, max: 1, calculable: true,
        inRange: { color: ['#3060cf', '#fffbbc', '#c23531'] },
      },
      series: [{
        type: 'heatmap',
        data,
        label: { show: true, formatter: (p: { value: number[] }) => p.value[2].toFixed(2) },
      }],
    };
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>持仓相关性分析</h2>

      {diversification && (
        <Card title="分散度评分" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Progress
                type="circle"
                percent={diversification.score}
                format={(p) => `${p}分`}
                strokeColor={diversification.score >= 60 ? '#52c41a' : '#faad14'}
              />
            </Col>
            <Col span={16}>
              <p>行业集中度: {diversification.industryConcentration.toFixed(1)}%</p>
              <p>最大持仓权重: {diversification.topHoldingWeight.toFixed(1)}%</p>
              {diversification.suggestions.map((s, i) => (
                <Alert key={i} message={s} type="info" style={{ marginTop: 8 }} />
              ))}
            </Col>
          </Row>
        </Card>
      )}

      {correlations.length > 0 && (
        <>
          <Card title="相关性热力图" style={{ marginBottom: 16 }}>
            <ReactECharts option={getHeatmapOption()} style={{ height: 400 }} />
          </Card>

          <Card title="相关性明细">
            <Table columns={columns} dataSource={correlations} rowKey={(r) => `${r.stock1}-${r.stock2}`} />
          </Card>
        </>
      )}

      {correlations.length === 0 && (
        <Alert message="持仓数量不足，无法进行相关性分析" type="warning" />
      )}
    </div>
  );
};

export default CorrelationAnalysis;
