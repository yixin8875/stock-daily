import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Button, Spin, Alert, Descriptions, List } from 'antd';
import { ReloadOutlined, RobotOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { request } from '../services';

interface StockCandidate {
  code: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  signals: string[];
  score: number;
  reason: string;
}

interface SectorData {
  code: string;
  name: string;
  change: number;
  leadingStock: string;
}

interface MarketSentiment {
  advanceCount: number;
  declineCount: number;
  limitUpCount: number;
  limitDownCount: number;
  sentimentScore: number;
  sentimentLevel: string;
}

interface MarketReport {
  date: string;
  marketOverview: {
    sentiment: MarketSentiment | null;
    trend: string;
    summary: string;
  };
  hotSectors: {
    sectors: SectorData[];
    analysis: string;
  };
  stockCandidates: StockCandidate[];
  riskWarnings: string[];
  tradingSuggestions: string[];
}

const AIMarketAnalysis: React.FC = () => {
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await request.get('/ai-analysis/report');
      if (res.data.success) setReport(res.data.data);
    } catch (e) {
      console.error('获取报告失败:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const getSectorOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: report?.hotSectors.sectors.slice(0, 10).map(s => s.name) || [],
      axisLabel: { rotate: 45 },
    },
    yAxis: { type: 'value', name: '涨跌幅%' },
    series: [{
      type: 'bar',
      data: report?.hotSectors.sectors.slice(0, 10).map(s => ({
        value: s.change,
        itemStyle: { color: s.change >= 0 ? '#cf1322' : '#3f8600' },
      })) || [],
    }],
  });

  const candidateColumns = [
    { title: '代码', dataIndex: 'code', width: 80 },
    { title: '名称', dataIndex: 'name', width: 80 },
    { title: '板块', dataIndex: 'sector', width: 80 },
    { title: '涨幅', dataIndex: 'change', render: (v: number) => (
      <span style={{ color: v >= 0 ? '#cf1322' : '#3f8600' }}>{v.toFixed(2)}%</span>
    )},
    { title: '信号', dataIndex: 'signals', render: (s: string[]) => s.map((t, i) => <Tag key={i} color="blue">{t}</Tag>) },
    { title: '评分', dataIndex: 'score', render: (v: number) => <Tag color={v >= 70 ? 'green' : 'orange'}>{v}</Tag> },
  ];

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <h2 style={{ margin: 0 }}>
            <RobotOutlined /> AI 大盘分析 - {report?.date}
          </h2>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={fetchReport}>刷新</Button>
        </Col>
      </Row>

      {report && (
        <>
          <Card title="市场概览" style={{ marginBottom: 16 }}>
            <Descriptions column={4}>
              <Descriptions.Item label="趋势">{report.marketOverview.trend}</Descriptions.Item>
              <Descriptions.Item label="涨跌">{report.marketOverview.summary}</Descriptions.Item>
              <Descriptions.Item label="涨停">
                {report.marketOverview.sentiment?.limitUpCount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="跌停">
                {report.marketOverview.sentiment?.limitDownCount || 0}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={16}>
            <Col span={14}>
              <Card title="热门板块">
                <ReactECharts option={getSectorOption()} style={{ height: 300 }} />
              </Card>
            </Col>
            <Col span={10}>
              <Card title="风险提示">
                {report.riskWarnings.map((w, i) => (
                  <Alert key={i} message={w} type="warning" style={{ marginBottom: 8 }} />
                ))}
                {report.tradingSuggestions.map((s, i) => (
                  <Alert key={i} message={s} type="info" style={{ marginBottom: 8 }} />
                ))}
              </Card>
            </Col>
          </Row>

          <Card title="AI精选股票" style={{ marginTop: 16 }}>
            <Table
              columns={candidateColumns}
              dataSource={report.stockCandidates}
              rowKey="code"
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default AIMarketAnalysis;
