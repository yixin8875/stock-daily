import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';

interface PositionAnalysis {
  stockCode: string;
  stockName: string;
  weight: number;
  profit: number;
  profitRate: number;
  holdDays: number;
  riskLevel: string;
}

const PositionAnalyzerPanel: React.FC = () => {
  const [positions] = useState<PositionAnalysis[]>([
    { stockCode: '600519', stockName: '贵州茅台', weight: 25, profit: 5000, profitRate: 12.5, holdDays: 30, riskLevel: 'low' },
    { stockCode: '000858', stockName: '五粮液', weight: 20, profit: 2000, profitRate: 8.2, holdDays: 15, riskLevel: 'medium' },
    { stockCode: '000001', stockName: '平安银行', weight: 15, profit: -500, profitRate: -3.5, holdDays: 7, riskLevel: 'high' },
  ]);

  const columns = [
    { title: '代码', dataIndex: 'stockCode', key: 'stockCode' },
    { title: '名称', dataIndex: 'stockName', key: 'stockName' },
    {
      title: '仓位',
      dataIndex: 'weight',
      key: 'weight',
      render: (v: number) => <Progress percent={v} size="small" style={{ width: 80 }} />,
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>
          ¥{v.toLocaleString()}
        </span>
      ),
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (v: string) => (
        <Tag color={v === 'high' ? 'red' : v === 'medium' ? 'orange' : 'green'}>
          {v === 'high' ? '高' : v === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
  ];

  const totalProfit = positions.reduce((s, p) => s + p.profit, 0);
  const concentration = Math.max(...positions.map(p => p.weight));

  return (
    <Card title={<><PieChartOutlined /> 持仓分析器</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="总盈亏" value={totalProfit} prefix="¥" valueStyle={{ color: totalProfit >= 0 ? '#3f8600' : '#cf1322' }} />
        </Col>
        <Col span={8}>
          <Statistic title="持仓数量" value={positions.length} suffix="只" />
        </Col>
        <Col span={8}>
          <Statistic title="最大集中度" value={concentration} suffix="%" />
        </Col>
      </Row>
      <Table columns={columns} dataSource={positions} rowKey="stockCode" size="small" pagination={false} />
    </Card>
  );
};

export default PositionAnalyzerPanel;
