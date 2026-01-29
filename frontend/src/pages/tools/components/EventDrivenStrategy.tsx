import React, { useState } from 'react';
import { Card, Form, Input, Button, Table, Tag } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

interface EventSignal {
  stockCode: string;
  stockName: string;
  eventType: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
}

const EventDrivenStrategy: React.FC = () => {
  const [form] = Form.useForm();
  const [signals, setSignals] = useState<EventSignal[]>([]);
  const [loading, setLoading] = useState(false);

  const handleScan = async (values: any) => {
    setLoading(true);
    const codes = values.stockCodes.split(',').map((s: string) => s.trim());

    // 模拟扫描结果
    const mockSignals: EventSignal[] = codes.map((code: string) => ({
      stockCode: code,
      stockName: `股票${code}`,
      eventType: Math.random() > 0.5 ? 'large_volume' : 'price_breakout',
      signal: Math.random() > 0.3 ? 'buy' : 'sell',
      confidence: Math.round(50 + Math.random() * 40),
      reason: Math.random() > 0.5 ? '成交量放大2.5倍' : '突破20日新高',
    }));

    setSignals(mockSignals.sort((a, b) => b.confidence - a.confidence));
    setLoading(false);
  };

  const columns = [
    { title: '代码', dataIndex: 'stockCode', key: 'stockCode' },
    { title: '名称', dataIndex: 'stockName', key: 'stockName' },
    {
      title: '事件类型',
      dataIndex: 'eventType',
      key: 'eventType',
      render: (v: string) => (
        <Tag>{v === 'large_volume' ? '放量' : '突破'}</Tag>
      ),
    },
    {
      title: '信号',
      dataIndex: 'signal',
      key: 'signal',
      render: (v: string) => (
        <Tag color={v === 'buy' ? 'green' : v === 'sell' ? 'red' : 'default'}>
          {v === 'buy' ? '买入' : v === 'sell' ? '卖出' : '观望'}
        </Tag>
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (v: number) => `${v}%`,
    },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
  ];

  return (
    <Card title={<><ThunderboltOutlined /> 事件驱动策略</>}>
      <Form form={form} layout="inline" onFinish={handleScan} style={{ marginBottom: 16 }}>
        <Form.Item name="stockCodes" label="股票代码" initialValue="000001,600519">
          <Input placeholder="逗号分隔" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            扫描信号
          </Button>
        </Form.Item>
      </Form>

      {signals.length > 0 && (
        <Table
          columns={columns}
          dataSource={signals}
          rowKey="stockCode"
          size="small"
          pagination={false}
        />
      )}
    </Card>
  );
};

export default EventDrivenStrategy;
