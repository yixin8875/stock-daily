import React from 'react'
import { Card, Button, Table, Input, InputNumber, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { SellPlan } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

const SellPlanCard: React.FC = () => {
  const { sellPlans, addSellPlan, removeSellPlan, updateSellPlan } = useDiaryStore()

  const handleAddPlan = () => {
    const newPlan: SellPlan = {
      id: generateId(),
      stockCode: '',
      stockName: '',
      targetPrice: null,
      sellPercent: null,
      reason: '',
      triggerCondition: '',
    }
    addSellPlan(newPlan)
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      width: 100,
      render: (value: string, record: SellPlan) => (
        <Input
          value={value}
          placeholder="如: 600000"
          onChange={(e) => updateSellPlan(record.id, { stockCode: e.target.value })}
        />
      ),
    },
    {
      title: '股票名称',
      dataIndex: 'stockName',
      key: 'stockName',
      width: 100,
      render: (value: string, record: SellPlan) => (
        <Input
          value={value}
          placeholder="股票名称"
          onChange={(e) => updateSellPlan(record.id, { stockName: e.target.value })}
        />
      ),
    },
    {
      title: '目标卖出价',
      dataIndex: 'targetPrice',
      key: 'targetPrice',
      width: 110,
      render: (value: number | null, record: SellPlan) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          placeholder="价格"
          style={{ width: '100%' }}
          onChange={(v) => updateSellPlan(record.id, { targetPrice: v })}
        />
      ),
    },
    {
      title: '卖出比例(%)',
      dataIndex: 'sellPercent',
      key: 'sellPercent',
      width: 110,
      render: (value: number | null, record: SellPlan) => (
        <InputNumber
          value={value}
          min={0}
          max={100}
          precision={1}
          placeholder="比例"
          style={{ width: '100%' }}
          onChange={(v) => updateSellPlan(record.id, { sellPercent: v })}
        />
      ),
    },
    {
      title: '卖出理由',
      dataIndex: 'reason',
      key: 'reason',
      render: (value: string, record: SellPlan) => (
        <Input
          value={value}
          placeholder="卖出理由"
          onChange={(e) => updateSellPlan(record.id, { reason: e.target.value })}
        />
      ),
    },
    {
      title: '触发条件',
      dataIndex: 'triggerCondition',
      key: 'triggerCondition',
      render: (value: string, record: SellPlan) => (
        <Input
          value={value}
          placeholder="触发条件"
          onChange={(e) => updateSellPlan(record.id, { triggerCondition: e.target.value })}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      render: (_: unknown, record: SellPlan) => (
        <Popconfirm
          title="确定删除这条记录吗?"
          onConfirm={() => removeSellPlan(record.id)}
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
      title="卖出计划"
      style={{ marginBottom: 16 }}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPlan}>
          添加计划
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={sellPlans}
        rowKey="id"
        pagination={false}
        scroll={{ x: 900 }}
        locale={{ emptyText: '暂无卖出计划，点击上方按钮添加' }}
      />
    </Card>
  )
}

export default SellPlanCard