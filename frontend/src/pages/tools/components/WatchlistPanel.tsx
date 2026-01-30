import React, { useState } from 'react';
import { Card, List, Tag, Button, Input, Select, Space, Popconfirm } from 'antd';
import { StarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface WatchItem {
  stockCode: string;
  stockName: string;
  groupId: string;
  targetPrice?: number;
}

interface Group {
  id: string;
  name: string;
  color: string;
}

const WatchlistPanel: React.FC = () => {
  const [groups] = useState<Group[]>([
    { id: '1', name: '重点关注', color: '#f5222d' },
    { id: '2', name: '观察池', color: '#1890ff' },
  ]);

  const [stocks, setStocks] = useState<WatchItem[]>([
    { stockCode: '600519', stockName: '贵州茅台', groupId: '1', targetPrice: 1800 },
    { stockCode: '300750', stockName: '宁德时代', groupId: '1', targetPrice: 280 },
    { stockCode: '000858', stockName: '五粮液', groupId: '2' },
  ]);

  const [newCode, setNewCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('1');

  const handleAdd = () => {
    if (newCode) {
      setStocks([...stocks, { stockCode: newCode, stockName: '加载中', groupId: selectedGroup }]);
      setNewCode('');
    }
  };

  const handleDelete = (code: string) => {
    setStocks(stocks.filter(s => s.stockCode !== code));
  };

  return (
    <Card title={<><StarOutlined /> 自选股管理</>} size="small">
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="股票代码" value={newCode} onChange={e => setNewCode(e.target.value)} style={{ width: 100 }} />
        <Select value={selectedGroup} onChange={setSelectedGroup} style={{ width: 100 }}>
          {groups.map(g => <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>)}
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加</Button>
      </Space>

      {groups.map(group => (
        <div key={group.id} style={{ marginBottom: 16 }}>
          <Tag color={group.color}>{group.name}</Tag>
          <List
            size="small"
            dataSource={stocks.filter(s => s.groupId === group.id)}
            renderItem={item => (
              <List.Item
                actions={[
                  <Popconfirm title="确定删除?" onConfirm={() => handleDelete(item.stockCode)}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <span>{item.stockCode} {item.stockName}</span>
                {item.targetPrice && <Tag color="green">目标: ¥{item.targetPrice}</Tag>}
              </List.Item>
            )}
          />
        </div>
      ))}
    </Card>
  );
};

export default WatchlistPanel;
