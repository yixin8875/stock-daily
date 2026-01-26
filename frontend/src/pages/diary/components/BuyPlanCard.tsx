import React from 'react'
import { Card, Button, Table, Input, InputNumber, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import type { BuyPlan } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

const BuyPlanCard: React.FC = () => {
  const { buyPlans, addBuyPlan, removeBuyPlan, updateBuyPlan } = useDiaryStore()

  const handleAddPlan = () => {
    const newPlan: BuyPlan = {
      id: generateId(),
      stockCode: '',
      stockName: '',
      targetPrice: null,
      positionPercent: null,
      reason: '',
      triggerCondition: '',
    }
    addBuyPlan(newPlan)
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      width: 100,
      render: (value: string, record: BuyPlan) => (
        <Input
          value={value}
          placeholder="如: 600000"
          onChange={(e) => updateBuyPlan(record.id, { stockCode: e.target.value })}
        />
      ),
    },
    {
      title: '股票名称',
      dataIndex: 'stockName',
      key: 'stockName',
      width: 100,
      render: (value: string, record: BuyPlan) => (
        <Input
          value={value}
          placeholder="股票名称"
          onChange={(e) => updateBuyPlan(record.id, { stockName: e.target.value })}
        />
      ),
    },
    {
      title: '目标买入价',
      dataIndex: 'targetPrice',
      key: 'targetPrice',
      width: 110,
      render: (value: number | null, record: BuyPlan) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          placeholder="价格"
          style={{ width: '100%' }}
          onChange={(v) => updateBuyPlan(record.id, { targetPrice: v })}
        />
      ),
    },
    {
      title: '计划仓位(%)',
      dataIndex: 'positionPercent',
      key: 'positionPercent',
      width: 110,
      render: (value: number | null, record: BuyPlan) => (
        <InputNumber
          value={value}
          min={0}
          max={100}
          precision={1}
          placeholder="仓位"
          style={{ width: '100%' }}
          onChange={(v) => updateBuyPlan(record.id, { positionPercent: v })}
        />
      ),
    },
    {
      title: '买入理由',
      dataIndex: 'reason',
      key: 'reason',
      render: (value: string, record: BuyPlan) => (
        <Input
          value={value}
          placeholder="买入理由"
          onChange={(e) => updateBuyPlan(record.id, { reason: e.target.value })}
        />
      ),
    },
    {
      title: '触发条件',
      dataIndex: 'triggerCondition',
      key: 'triggerCondition',
      render: (value: string, record: BuyPlan) => (
        <Input
          value={value}
          placeholder="触发条件"
          onChange={(e) => updateBuyPlan(record.id, { triggerCondition: e.target.value })}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      render: (_: unknown, record: BuyPlan) => (
        <Popconfirm
          title="确定删除这条记录吗?"
          onConfirm={() => removeBuyPlan(record.id)}
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
      title="买入计划"
      style={{ marginBottom: 16 }}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPlan}>
          添加计划
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={buyPlans}
        rowKey="id"
        pagination={false}
        scroll={{ x: 900 }}
        locale={{ emptyText: '暂无买入计划，点击上方按钮添加' }}
      />
    </Card>
  )
}

export default BuyPlanCard