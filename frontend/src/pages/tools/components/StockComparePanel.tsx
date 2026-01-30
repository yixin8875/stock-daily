import React, { useState } from 'react';
import { Card, Input, Button, Table, Tag, Space } from 'antd';
import { BarChartOutlined, PlusOutlined } from '@ant-design/icons';

interface StockItem {
  stockCode: string;
  stockName: string;
  price: number;
  change: number;
  pe: number;
  pb: number;
  marketCap: number;
}

const StockComparePanel: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [stocks, setStocks] = useState<StockItem[]>([
    { stockCode: '600519', stockName: '贵州茅台', price: 1680, change: 1.2, pe: 28.5, pb: 8.2, marketCap: 21000 },
    { stockCode: '000858', stockName: '五粮液', price: 142, change: -0.5, pe: 22.3, pb: 5.1, marketCap: 5500 },
  ]);

  const handleAdd = () => {
    if (inputCode && !stocks.find(s => s.stockCode === inputCode)) {
      setStocks([...stocks, {
        stockCode: inputCode,
        stockName: '加载中...',
        price: 0, change: 0, pe: 0, pb: 0, marketCap: 0,
      }]);
      setInputCode('');
    }
  };

  const columns = [
    { title: '代码', dataIndex: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', width: 100 },
    {
      title: '现价',
      dataIndex: 'price',
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '涨跌',
      dataIndex: 'change',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}%
        </span>
      ),
    },
    {
      title: 'PE',
      dataIndex: 'pe',
      render: (v: number, _: any, idx: number) => {
        const min = Math.min(...stocks.map(s => s.pe).filter(x => x > 0));
        return <Tag color={v === min ? 'green' : 'default'}>{v.toFixed(1)}</Tag>;
      },
    },
    {
      title: 'PB',
      dataIndex: 'pb',
      render: (v: number) => {
        const min = Math.min(...stocks.map(s => s.pb).filter(x => x > 0));
        return <Tag color={v === min ? 'green' : 'default'}>{v.toFixed(2)}</Tag>;
      },
    },
    { title: '市值(亿)', dataIndex: 'marketCap', render: (v: number) => v.toFixed(0) },
  ];

  return (
    <Card title={<><BarChartOutlined /> 股票对比分析</>} size="small">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="输入股票代码"
          value={inputCode}
          onChange={e => setInputCode(e.target.value)}
          style={{ width: 120 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加</Button>
      </Space>
      <Table columns={columns} dataSource={stocks} rowKey="stockCode" size="small" pagination={false} />
    </Card>
  );
};

export default StockComparePanel;
