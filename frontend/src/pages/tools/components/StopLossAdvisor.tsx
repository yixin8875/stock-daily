import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Table, Tag, Row, Col, Statistic } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';

interface StopLossSuggestion {
  type: string;
  stopPrice: number;
  distance: number;
  distancePercent: number;
  description: string;
}

const StopLossAdvisor: React.FC = () => {
  const [form] = Form.useForm();
  const [suggestions, setSuggestions] = useState<StopLossSuggestion[]>([]);
  const [atrInfo, setAtrInfo] = useState<{ atr: number; atrPercent: number } | null>(null);

  const handleAnalyze = async (values: any) => {
    const { stockCode, entryPrice } = values;

    // 模拟 ATR 计算（实际应调用后端 API）
    const atr = entryPrice * 0.03;
    const currentPrice = entryPrice;

    setAtrInfo({
      atr: Math.round(atr * 100) / 100,
      atrPercent: Math.round((atr / currentPrice) * 10000) / 100,
    });

    const newSuggestions: StopLossSuggestion[] = [];

    // ATR止损
    const atrStop = currentPrice - 2 * atr;
    newSuggestions.push({
      type: 'ATR动态止损',
      stopPrice: Math.round(atrStop * 100) / 100,
      distance: Math.round((entryPrice - atrStop) * 100) / 100,
      distancePercent: Math.round(((entryPrice - atrStop) / entryPrice) * 10000) / 100,
      description: '基于2倍ATR，适合趋势交易',
    });

    // 固定比例止损
    const percentStop = entryPrice * 0.95;
    newSuggestions.push({
      type: '固定比例止损',
      stopPrice: Math.round(percentStop * 100) / 100,
      distance: Math.round((entryPrice - percentStop) * 100) / 100,
      distancePercent: 5,
      description: '固定5%止损，简单易执行',
    });

    // 支撑位止损
    const supportStop = entryPrice * 0.92;
    newSuggestions.push({
      type: '支撑位止损',
      stopPrice: Math.round(supportStop * 100) / 100,
      distance: Math.round((entryPrice - supportStop) * 100) / 100,
      distancePercent: 8,
      description: '跌破近期支撑位时止损',
    });

    // 移动均线止损
    const maStop = entryPrice * 0.96;
    newSuggestions.push({
      type: '移动均线止损',
      stopPrice: Math.round(maStop * 100) / 100,
      distance: Math.round((entryPrice - maStop) * 100) / 100,
      distancePercent: 4,
      description: '跌破10日均线时止损',
    });

    setSuggestions(newSuggestions.sort((a, b) => b.stopPrice - a.stopPrice));
  };

  const columns = [
    { title: '止损类型', dataIndex: 'type', key: 'type' },
    {
      title: '止损价',
      dataIndex: 'stopPrice',
      key: 'stopPrice',
      render: (v: number) => <span style={{ color: '#cf1322' }}>¥{v}</span>,
    },
    {
      title: '距离',
      dataIndex: 'distancePercent',
      key: 'distancePercent',
      render: (v: number) => (
        <Tag color={v <= 5 ? 'green' : v <= 8 ? 'orange' : 'red'}>{v}%</Tag>
      ),
    },
    { title: '说明', dataIndex: 'description', key: 'description' },
  ];

  return (
    <Card title={<><SafetyOutlined /> 智能止损建议</>}>
      <Form form={form} layout="inline" onFinish={handleAnalyze} style={{ marginBottom: 16 }}>
        <Form.Item name="stockCode" label="股票代码" initialValue="000001">
          <Input placeholder="输入股票代码" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item name="entryPrice" label="买入价" initialValue={15}>
          <InputNumber min={0.01} step={0.1} prefix="¥" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">获取建议</Button>
        </Form.Item>
      </Form>

      {atrInfo && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Statistic title="ATR值" value={atrInfo.atr} prefix="¥" />
          </Col>
          <Col span={12}>
            <Statistic title="ATR占比" value={atrInfo.atrPercent} suffix="%" />
          </Col>
        </Row>
      )}

      {suggestions.length > 0 && (
        <Table columns={columns} dataSource={suggestions} rowKey="type" size="small" pagination={false} />
      )}
    </Card>
  );
};

export default StopLossAdvisor;
