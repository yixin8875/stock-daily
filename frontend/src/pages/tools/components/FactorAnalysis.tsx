import React, { useState } from 'react';
import { Card, Form, Slider, Button, Table, Tag, Row, Col } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';

interface FactorScore {
  stockCode: string;
  stockName: string;
  factors: Record<string, number>;
  totalScore: number;
}

const FactorAnalysis: React.FC = () => {
  const [weights, setWeights] = useState({
    value: 25,
    momentum: 20,
    quality: 25,
    size: 15,
    volatility: 15,
  });
  const [results, setResults] = useState<FactorScore[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScreen = async () => {
    setLoading(true);
    // 模拟数据
    const mockData: FactorScore[] = [
      { stockCode: '600519', stockName: '贵州茅台', factors: { value: 60, momentum: 70, quality: 95, size: 40, volatility: 80 }, totalScore: 0 },
      { stockCode: '000858', stockName: '五粮液', factors: { value: 65, momentum: 65, quality: 85, size: 50, volatility: 75 }, totalScore: 0 },
      { stockCode: '000001', stockName: '平安银行', factors: { value: 80, momentum: 55, quality: 70, size: 60, volatility: 70 }, totalScore: 0 },
    ];

    mockData.forEach(stock => {
      stock.totalScore = Math.round(
        (stock.factors.value * weights.value +
        stock.factors.momentum * weights.momentum +
        stock.factors.quality * weights.quality +
        stock.factors.size * weights.size +
        stock.factors.volatility * weights.volatility) / 100
      );
    });

    setResults(mockData.sort((a, b) => b.totalScore - a.totalScore));
    setLoading(false);
  };

  const columns = [
    { title: '代码', dataIndex: 'stockCode', key: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', key: 'stockName', width: 100 },
    {
      title: '价值',
      key: 'value',
      render: (_: any, r: FactorScore) => <Tag color="blue">{r.factors.value}</Tag>,
    },
    {
      title: '动量',
      key: 'momentum',
      render: (_: any, r: FactorScore) => <Tag color="green">{r.factors.momentum}</Tag>,
    },
    {
      title: '质量',
      key: 'quality',
      render: (_: any, r: FactorScore) => <Tag color="purple">{r.factors.quality}</Tag>,
    },
    {
      title: '综合得分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (v: number) => <strong>{v}</strong>,
    },
  ];

  return (
    <Card title={<><ExperimentOutlined /> 因子分析选股</>}>
      <Row gutter={16}>
        <Col span={4}>
          <div>价值因子: {weights.value}%</div>
          <Slider value={weights.value} onChange={v => setWeights({ ...weights, value: v })} />
        </Col>
        <Col span={4}>
          <div>动量因子: {weights.momentum}%</div>
          <Slider value={weights.momentum} onChange={v => setWeights({ ...weights, momentum: v })} />
        </Col>
        <Col span={4}>
          <div>质量因子: {weights.quality}%</div>
          <Slider value={weights.quality} onChange={v => setWeights({ ...weights, quality: v })} />
        </Col>
        <Col span={4}>
          <div>规模因子: {weights.size}%</div>
          <Slider value={weights.size} onChange={v => setWeights({ ...weights, size: v })} />
        </Col>
        <Col span={4}>
          <div>波动因子: {weights.volatility}%</div>
          <Slider value={weights.volatility} onChange={v => setWeights({ ...weights, volatility: v })} />
        </Col>
      </Row>
      <Button type="primary" onClick={handleScreen} loading={loading} style={{ margin: '16px 0' }}>
        开始筛选
      </Button>
      {results.length > 0 && (
        <Table columns={columns} dataSource={results} rowKey="stockCode" size="small" pagination={false} />
      )}
    </Card>
  );
};

export default FactorAnalysis;
