import React, { useState } from 'react';
import { Card, Table, Tag, Rate, Row, Col, Statistic } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';

interface TradeReview {
  id: string;
  date: string;
  stockCode: string;
  stockName: string;
  tradeType: string;
  rating: number;
  emotionState: number;
}

const TradeReviewPanel: React.FC = () => {
  const [reviews] = useState<TradeReview[]>([
    { id: '1', date: '2025-01-15', stockCode: '600519', stockName: '贵州茅台', tradeType: 'buy', rating: 4, emotionState: 3 },
    { id: '2', date: '2025-01-10', stockCode: '000858', stockName: '五粮液', tradeType: 'sell', rating: 3, emotionState: 4 },
  ]);

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 100 },
    { title: '代码', dataIndex: 'stockCode', key: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', key: 'stockName', width: 100 },
    {
      title: '类型',
      dataIndex: 'tradeType',
      key: 'tradeType',
      render: (v: string) => <Tag color={v === 'buy' ? 'green' : 'red'}>{v === 'buy' ? '买入' : '卖出'}</Tag>,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (v: number) => <Rate disabled defaultValue={v} style={{ fontSize: 12 }} />,
    },
  ];

  return (
    <Card title={<><HistoryOutlined /> 交易复盘</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="复盘总数" value={reviews.length} />
        </Col>
        <Col span={8}>
          <Statistic title="平均评分" value={avgRating.toFixed(1)} suffix="/ 5" />
        </Col>
      </Row>
      <Table columns={columns} dataSource={reviews} rowKey="id" size="small" />
    </Card>
  );
};

export default TradeReviewPanel;
