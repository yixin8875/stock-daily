import React, { useState } from 'react';
import { Card, Table, Tag } from 'antd';
import { UnlockOutlined } from '@ant-design/icons';

interface UnlockInfo {
  stockCode: string;
  stockName: string;
  unlockDate: string;
  unlockRatio: number;
  marketValue: number;
}

const UnlockReminderPanel: React.FC = () => {
  const [data] = useState<UnlockInfo[]>([
    { stockCode: '000001', stockName: '平安银行', unlockDate: '2025-02-15', unlockRatio: 5.2, marketValue: 12.5 },
    { stockCode: '600519', stockName: '贵州茅台', unlockDate: '2025-02-20', unlockRatio: 2.1, marketValue: 45.8 },
  ]);

  const columns = [
    { title: '代码', dataIndex: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', width: 100 },
    { title: '解禁日', dataIndex: 'unlockDate' },
    {
      title: '解禁比例',
      dataIndex: 'unlockRatio',
      render: (v: number) => (
        <Tag color={v > 5 ? 'red' : v > 2 ? 'orange' : 'green'}>{v}%</Tag>
      ),
    },
    { title: '市值(亿)', dataIndex: 'marketValue' },
  ];

  return (
    <Card title={<><UnlockOutlined /> 限售解禁提醒</>} size="small">
      <Table columns={columns} dataSource={data} rowKey="stockCode" size="small" pagination={false} />
    </Card>
  );
};

export default UnlockReminderPanel;
