import React, { useState } from 'react';
import { Card, Table, Tag, Progress, Row, Col, Statistic, List } from 'antd';
import { MedicineBoxOutlined } from '@ant-design/icons';

interface DiagnosisResult {
  stockCode: string;
  stockName: string;
  healthScore: number;
  issues: { type: string; severity: string; description: string }[];
  suggestions: string[];
}

const AIPositionDiagnosis: React.FC = () => {
  const [results] = useState<DiagnosisResult[]>([
    {
      stockCode: '600519',
      stockName: '贵州茅台',
      healthScore: 85,
      issues: [],
      suggestions: ['持仓状态良好，继续持有'],
    },
    {
      stockCode: '000001',
      stockName: '平安银行',
      healthScore: 45,
      issues: [
        { type: 'loss', severity: 'medium', description: '浮亏12.5%' },
        { type: 'concentration', severity: 'medium', description: '仓位偏重，占比22%' },
      ],
      suggestions: ['考虑分批补仓摊薄成本', '建议适当减仓，分散风险'],
    },
  ]);

  const avgHealth = results.reduce((s, r) => s + r.healthScore, 0) / results.length;

  const columns = [
    { title: '代码', dataIndex: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', width: 100 },
    {
      title: '健康度',
      dataIndex: 'healthScore',
      render: (v: number) => (
        <Progress
          percent={v}
          size="small"
          status={v >= 70 ? 'success' : v >= 40 ? 'normal' : 'exception'}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: '问题',
      dataIndex: 'issues',
      render: (issues: any[]) =>
        issues.length === 0 ? (
          <Tag color="green">无</Tag>
        ) : (
          issues.map((i, idx) => (
            <Tag key={idx} color={i.severity === 'high' ? 'red' : 'orange'}>
              {i.description}
            </Tag>
          ))
        ),
    },
  ];

  return (
    <Card title={<><MedicineBoxOutlined /> AI 持仓诊断</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="平均健康度" value={avgHealth.toFixed(0)} suffix="分" />
        </Col>
        <Col span={8}>
          <Statistic title="诊断持仓" value={results.length} suffix="只" />
        </Col>
        <Col span={8}>
          <Statistic
            title="问题持仓"
            value={results.filter(r => r.issues.length > 0).length}
            suffix="只"
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
      </Row>
      <Table columns={columns} dataSource={results} rowKey="stockCode" size="small" pagination={false} />
    </Card>
  );
};

export default AIPositionDiagnosis;
