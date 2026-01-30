import React, { useState } from 'react';
import { Card, Table, Tag, Row, Col, Statistic } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

interface StressResult {
  scenario: string;
  lossPercent: number;
  recoveryDays: number;
}

const StressTestPanel: React.FC = () => {
  const [results] = useState<StressResult[]>([
    { scenario: '温和回调', lossPercent: -5.5, recoveryDays: 10 },
    { scenario: '中度下跌', lossPercent: -11.2, recoveryDays: 20 },
    { scenario: '大幅下跌', lossPercent: -22.5, recoveryDays: 40 },
    { scenario: '极端暴跌', lossPercent: -33.8, recoveryDays: 60 },
  ]);

  const columns = [
    { title: '情景', dataIndex: 'scenario' },
    {
      title: '预计亏损',
      dataIndex: 'lossPercent',
      render: (v: number) => (
        <span style={{ color: '#cf1322' }}>{v}%</span>
      ),
    },
    {
      title: '恢复周期',
      dataIndex: 'recoveryDays',
      render: (v: number) => `${v}天`,
    },
  ];

  return (
    <Card title={<><ExperimentOutlined /> 压力测试</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic title="风险评分" value={70} suffix="/ 100" />
        </Col>
        <Col span={12}>
          <Tag color="orange">中高风险</Tag>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={results}
        rowKey="scenario"
        size="small"
        pagination={false}
      />
    </Card>
  );
};

export default StressTestPanel;
