import React from 'react'
import { Card, Button, Table, Input, InputNumber, Select, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { TradeRecord, TradeDirection } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'
import { TagSelect } from '@/components'

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

const TradeRecordCard: React.FC = () => {
  const { tradeRecords, addTradeRecord, removeTradeRecord, updateTradeRecord } = useDiaryStore()

  const handleAddRecord = () => {
    const newRecord: TradeRecord = {
      id: generateId(),
      stockCode: '',
      stockName: '',
      direction: 'buy',
      price: 0,
      quantity: 0,
      reason: '',
      strategyTagId: null,
    }
    addTradeRecord(newRecord)
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      width: 120,
      render: (value: string, record: TradeRecord) => (
        <Input
          value={value}
          placeholder="如: 600000"
          onChange={(e) => updateTradeRecord(record.id, { stockCode: e.target.value })}
        />
      ),
    },
    {
      title: '股票名称',
      dataIndex: 'stockName',
      key: 'stockName',
      width: 120,
      render: (value: string, record: TradeRecord) => (
        <Input
          value={value}
          placeholder="股票名称"
          onChange={(e) => updateTradeRecord(record.id, { stockName: e.target.value })}
        />
      ),
    },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      width: 100,
      render: (value: TradeDirection, record: TradeRecord) => (
        <Select
          value={value}
          style={{ width: '100%' }}
          onChange={(v) => updateTradeRecord(record.id, { direction: v })}
          options={[
            { label: '买入', value: 'buy' },
            { label: '卖出', value: 'sell' },
          ]}
        />
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (value: number, record: TradeRecord) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          onChange={(v) => updateTradeRecord(record.id, { price: v || 0 })}
        />
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value: number, record: TradeRecord) => (
        <InputNumber
          value={value}
          min={0}
          step={100}
          style={{ width: '100%' }}
          onChange={(v) => updateTradeRecord(record.id, { quantity: v || 0 })}
        />
      ),
    },
    {
      title: '交易原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (value: string, record: TradeRecord) => (
        <Input
          value={value}
          placeholder="交易原因"
          onChange={(e) => updateTradeRecord(record.id, { reason: e.target.value })}
        />
      ),
    },
    {
      title: '策略标签',
      dataIndex: 'strategyTagId',
      key: 'strategyTagId',
      width: 150,
      render: (value: number | null, record: TradeRecord) => (
        <TagSelect
          mode="single"
          category="strategy"
          placeholder="选择策略"
          value={value || undefined}
          onChange={(v) => updateTradeRecord(record.id, { strategyTagId: v as number || null })}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: TradeRecord) => (
        <Popconfirm
          title="确定删除这条记录吗?"
          onConfirm={() => removeTradeRecord(record.id)}
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
      title="交易记录"
      style={{ marginBottom: 16 }}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRecord}>
          添加记录
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={tradeRecords}
        rowKey="id"
        pagination={false}
        scroll={{ x: 900 }}
        locale={{ emptyText: '暂无交易记录，点击上方按钮添加' }}
      />
    </Card>
  )
}

export default TradeRecordCard
