import React, { useState } from 'react';
import { Card, Table, Tag } from 'antd';
import { NodeIndexOutlined } from '@ant-design/icons';

interface FlowItem {
  name: string;
  inflow: number;
  direction: string;
}

const MoneyFlowGraph: React.FC = () => {
  const [flows] = useState<FlowItem[]>([
    { name: '银行', inflow: 15.2, direction: 'in' },
    { name: '新能源', inflow: 12.8, direction: 'in' },
    { name: '白酒', inflow: -8.5, direction: 'out' },
    { name: '医药', inflow: -6.2, direction: 'out' },
  ]);

  const columns = [
    { title: '板块', dataIndex: 'name' },
    {
      title: '资金流向',
      dataIndex: 'inflow',
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#3f8600' : '#cf1322' }}>
          {v > 0 ? '+' : ''}{v}亿
        </span>
      ),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      render: (v: string) => (
        <Tag color={v === 'in' ? 'green' : 'red'}>
          {v === 'in' ? '流入' : '流出'}
        </Tag>
      ),
    },
  ];

  return (
    <Card title={<><NodeIndexOutlined /> 资金流向图谱</>} size="small">
      <Table columns={columns} dataSource={flows} rowKey="name" size="small" pagination={false} />
    </Card>
  );
};

export default MoneyFlowGraph;
