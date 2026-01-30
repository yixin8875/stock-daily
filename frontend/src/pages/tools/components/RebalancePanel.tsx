import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { SwapOutlined } from '@ant-design/icons';

interface Suggestion {
  stockCode: string;
  stockName: string;
  action: 'buy' | 'sell' | 'hold';
  currentWeight: number;
  targetWeight: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const RebalancePanel: React.FC = () => {
  const [suggestions] = useState<Suggestion[]>([
    { stockCode: '600519', stockName: '贵州茅台', action: 'sell', currentWeight: 35, targetWeight: 25, reason: '单只持仓35%过重，建议分散', priority: 'medium' },
    { stockCode: '000858', stockName: '五粮液', action: 'sell', currentWeight: 18, targetWeight: 9, reason: '盈利32%，建议止盈减仓', priority: 'high' },
    { stockCode: '300750', stockName: '宁德时代', action: 'buy', currentWeight: 8, targetWeight: 12, reason: '技术指标向好：均线多头排列', priority: 'low' },
  ]);

  const columns = [
    { title: '代码', dataIndex: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', width: 100 },
    {
      title: '建议',
      dataIndex: 'action',
      render: (v: string) => (
        <Tag color={v === 'buy' ? 'green' : v === 'sell' ? 'red' : 'default'}>
          {v === 'buy' ? '加仓' : v === 'sell' ? '减仓' : '持有'}
        </Tag>
      ),
    },
    {
      title: '当前仓位',
      dataIndex: 'currentWeight',
      render: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: '目标仓位',
      dataIndex: 'targetWeight',
      render: (v: number) => `${v.toFixed(1)}%`,
    },
    { title: '原因', dataIndex: 'reason', ellipsis: true },
    {
      title: '优先级',
      dataIndex: 'priority',
      render: (v: string) => (
        <Tag color={v === 'high' ? 'red' : v === 'medium' ? 'orange' : 'blue'}>
          {v === 'high' ? '高' : v === 'medium' ? '中' : '低'}
        </Tag>
      ),
    },
  ];

  return (
    <Card
      title={<><SwapOutlined /> 智能调仓建议</>}
      size="small"
      extra={<Button type="primary" size="small">刷新建议</Button>}
    >
      <Table
        columns={columns}
        dataSource={suggestions}
        rowKey="stockCode"
        size="small"
        pagination={false}
      />
    </Card>
  );
};

export default RebalancePanel;
