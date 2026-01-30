import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';

const AttributionPanel: React.FC = () => {
  const [data] = useState({
    totalReturn: 8.5,
    sectorAttribution: [
      { sector: '创业板', contribution: 4.2, weight: 35 },
      { sector: '科创板', contribution: 2.8, weight: 25 },
      { sector: '沪市主板', contribution: 1.5, weight: 30 },
      { sector: '深市主板', contribution: 0, weight: 10 },
    ],
    stockAttribution: [
      { stockCode: '300750', stockName: '宁德时代', contribution: 3500 },
      { stockCode: '688981', stockName: '中芯国际', contribution: 2200 },
      { stockCode: '600519', stockName: '贵州茅台', contribution: 1800 },
    ],
    timingAttribution: [
      { period: '开盘30分钟', contribution: 2800 },
      { period: '上午盘中', contribution: 1500 },
      { period: '下午开盘', contribution: 800 },
      { period: '尾盘', contribution: 2400 },
    ],
  });

  const sectorColumns = [
    { title: '板块', dataIndex: 'sector' },
    {
      title: '贡献',
      dataIndex: 'contribution',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(1)}%
        </span>
      ),
    },
    { title: '仓位', dataIndex: 'weight', render: (v: number) => `${v}%` },
  ];

  return (
    <Card title={<><PieChartOutlined /> 持仓归因分析</>} size="small">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Statistic
            title="总收益率"
            value={data.totalReturn}
            precision={2}
            suffix="%"
            valueStyle={{ color: data.totalReturn >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>板块归因</div>
        <Table
          columns={sectorColumns}
          dataSource={data.sectorAttribution}
          rowKey="sector"
          size="small"
          pagination={false}
        />
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>个股贡献TOP3</div>
          {data.stockAttribution.map(s => (
            <div key={s.stockCode} style={{ marginBottom: 4 }}>
              <span>{s.stockName}</span>
              <Tag color="green" style={{ marginLeft: 8 }}>+¥{s.contribution}</Tag>
            </div>
          ))}
        </Col>
        <Col span={12}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>择时贡献</div>
          {data.timingAttribution.map(t => (
            <div key={t.period} style={{ marginBottom: 4 }}>
              <span>{t.period}</span>
              <Tag color="blue" style={{ marginLeft: 8 }}>¥{t.contribution}</Tag>
            </div>
          ))}
        </Col>
      </Row>
    </Card>
  );
};

export default AttributionPanel;
