import React, { useState } from 'react';
import { Card, Table, Tag, Row, Col, Statistic, Progress } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';

interface CorrelationRisk {
  pair: string;
  correlation: number;
  riskLevel: string;
}

const CorrelationRiskPanel: React.FC = () => {
  const [risks] = useState<CorrelationRisk[]>([
    { pair: '600519 - 000858', correlation: 0.85, riskLevel: 'high' },
    { pair: '000001 - 601318', correlation: 0.72, riskLevel: 'medium' },
  ]);

  const [overallRisk] = useState(65);

  const columns = [
    { title: '股票对', dataIndex: 'pair' },
    {
      title: '相关系数',
      dataIndex: 'correlation',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      render: (v: string) => (
        <Tag color={v === 'high' ? 'red' : 'orange'}>
          {v === 'high' ? '高' : '中'}
        </Tag>
      ),
    },
  ];

  return (
    <Card title={<><ApartmentOutlined /> 关联风险分析</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic title="组合风险评分" value={overallRisk} suffix="/ 100" />
        </Col>
        <Col span={12}>
          <Progress
            percent={overallRisk}
            status={overallRisk > 70 ? 'exception' : 'normal'}
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={risks}
        rowKey="pair"
        size="small"
        pagination={false}
      />
    </Card>
  );
};

export default CorrelationRiskPanel;
