import React, { useState } from 'react';
import { Card, Table, Tag, Row, Col, Statistic } from 'antd';
import { RadarChartOutlined } from '@ant-design/icons';

interface TradePattern {
  name: string;
  frequency: number;
  impact: number;
  description: string;
}

const TradePatternPanel: React.FC = () => {
  const [patterns] = useState<TradePattern[]>([
    { name: '追涨倾向', frequency: 45, impact: -15, description: '倾向于在上涨时买入' },
    { name: '频繁交易', frequency: 60, impact: -20, description: '日均交易2.5次' },
    { name: '短线风格', frequency: 70, impact: 0, description: '平均持仓周期较短' },
  ]);

  const columns = [
    { title: '模式', dataIndex: 'name' },
    {
      title: '频率',
      dataIndex: 'frequency',
      render: (v: number) => <Tag color={v > 50 ? 'orange' : 'blue'}>{v}%</Tag>,
    },
    {
      title: '影响',
      dataIndex: 'impact',
      render: (v: number) => (
        <span style={{ color: v < 0 ? '#cf1322' : '#3f8600' }}>{v}%</span>
      ),
    },
    { title: '描述', dataIndex: 'description' },
  ];

  return (
    <Card title={<><RadarChartOutlined /> 交易模式识别</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic title="主导风格" value="短线投机" />
        </Col>
        <Col span={12}>
          <Statistic title="识别模式" value={patterns.length} suffix="个" />
        </Col>
      </Row>
      <Table columns={columns} dataSource={patterns} rowKey="name" size="small" pagination={false} />
    </Card>
  );
};

export default TradePatternPanel;
