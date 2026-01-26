import React from 'react'
import { Card, Button, Table, Input, Select, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { WatchStock, WatchLevel } from '@/types/diary'
import { WATCH_LEVELS } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

const WatchStockCard: React.FC = () => {
  const { watchStocks, addWatchStock, removeWatchStock, updateWatchStock } = useDiaryStore()

  const handleAddStock = () => {
    const newStock: WatchStock = {
      id: generateId(),
      stockCode: '',
      stockName: '',
      reason: '',
      level: 'medium',
      technicalPosition: '',
    }
    addWatchStock(newStock)
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      width: 110,
      render: (value: string, record: WatchStock) => (
        <Input
          value={value}
          placeholder="如: 600000"
          onChange={(e) => updateWatchStock(record.id, { stockCode: e.target.value })}
        />
      ),
    },
    {
      title: '股票名称',
      dataIndex: 'stockName',
      key: 'stockName',
      width: 110,
      render: (value: string, record: WatchStock) => (
        <Input
          value={value}
          placeholder="股票名称"
          onChange={(e) => updateWatchStock(record.id, { stockName: e.target.value })}
        />
      ),
    },
    {
      title: '关注级别',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (value: WatchLevel, record: WatchStock) => (
        <Select
          value={value}
          style={{ width: '100%' }}
          onChange={(v) => updateWatchStock(record.id, { level: v })}
          options={WATCH_LEVELS.map((item) => ({ label: item.label, value: item.value }))}
        />
      ),
    },
    {
      title: '关注原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (value: string, record: WatchStock) => (
        <Input
          value={value}
          placeholder="关注原因"
          onChange={(e) => updateWatchStock(record.id, { reason: e.target.value })}
        />
      ),
    },
    {
      title: '技术位置',
      dataIndex: 'technicalPosition',
      key: 'technicalPosition',
      width: 140,
      render: (value: string | undefined, record: WatchStock) => (
        <Input
          value={value}
          placeholder="可选"
          onChange={(e) => updateWatchStock(record.id, { technicalPosition: e.target.value })}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      render: (_: unknown, record: WatchStock) => (
        <Popconfirm
          title="确定删除这条记录吗?"
          onConfirm={() => removeWatchStock(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ]

  return (
    <Card
      title="关注股票"
      style={{ marginBottom: 16 }}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStock}>
          添加股票
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={watchStocks}
        rowKey="id"
        pagination={false}
        scroll={{ x: 800 }}
        locale={{ emptyText: '暂无关注股票，点击上方按钮添加' }}
      />
    </Card>
  )
}

export default WatchStockCard