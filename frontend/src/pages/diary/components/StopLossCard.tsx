import React from 'react'
import { Card, Button, Table, Input, InputNumber, Popconfirm, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { StopLoss } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

const { Text } = Typography

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 计算止损幅度
const calculateStopLossPercent = (stopPrice: number | null, costPrice: number | null | undefined): string => {
  if (!stopPrice || !costPrice || costPrice === 0) return '-'
  const percent = ((stopPrice - costPrice) / costPrice) * 100
  return percent.toFixed(2) + '%'
}

const StopLossCard: React.FC = () => {
  const { stopLosses, addStopLoss, removeStopLoss, updateStopLoss } = useDiaryStore()

  const handleAddStopLoss = () => {
    const newStopLoss: StopLoss = {
      id: generateId(),
      stockCode: '',
      stockName: '',
      stopPrice: null,
      costPrice: null,
      reason: '',
    }
    addStopLoss(newStopLoss)
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      width: 110,
      render: (value: string, record: StopLoss) => (
        <Input
          value={value}
          placeholder="如: 600000"
          onChange={(e) => updateStopLoss(record.id, { stockCode: e.target.value })}
        />
      ),
    },
    {
      title: '股票名称',
      dataIndex: 'stockName',
      key: 'stockName',
      width: 110,
      render: (value: string, record: StopLoss) => (
        <Input
          value={value}
          placeholder="股票名称"
          onChange={(e) => updateStopLoss(record.id, { stockName: e.target.value })}
        />
      ),
    },
    {
      title: '止损价位',
      dataIndex: 'stopPrice',
      key: 'stopPrice',
      width: 110,
      render: (value: number | null, record: StopLoss) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          placeholder="止损价"
          style={{ width: '100%' }}
          onChange={(v) => updateStopLoss(record.id, { stopPrice: v })}
        />
      ),
    },
    {
      title: '持仓成本',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 110,
      render: (value: number | null | undefined, record: StopLoss) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          placeholder="可选"
          style={{ width: '100%' }}
          onChange={(v) => updateStopLoss(record.id, { costPrice: v })}
        />
      ),
    },
    {
      title: '止损幅度',
      key: 'stopLossPercent',
      width: 100,
      render: (_: unknown, record: StopLoss) => {
        const percent = calculateStopLossPercent(record.stopPrice, record.costPrice)
        const isNegative = percent !== '-' && parseFloat(percent) < 0
        return (
          <Text type={isNegative ? 'danger' : undefined}>
            {percent}
          </Text>
        )
      },
    },
    {
      title: '止损原因',
      dataIndex: 'reason',
      key: 'reason',
      render: (value: string, record: StopLoss) => (
        <Input
          value={value}
          placeholder="止损原因"
          onChange={(e) => updateStopLoss(record.id, { reason: e.target.value })}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      render: (_: unknown, record: StopLoss) => (
        <Popconfirm
          title="确定删除这条记录吗?"
          onConfirm={() => removeStopLoss(record.id)}
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
      title="止损设置"
      style={{ marginBottom: 16 }}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStopLoss}>
          添加止损
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={stopLosses}
        rowKey="id"
        pagination={false}
        scroll={{ x: 850 }}
        locale={{ emptyText: '暂无止损设置，点击上方按钮添加' }}
      />
    </Card>
  )
}

export default StopLossCard