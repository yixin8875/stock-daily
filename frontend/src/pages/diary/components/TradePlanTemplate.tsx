import React, { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, Table, Modal, Tag, Space } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input

interface TradePlan {
  id: string
  stockCode: string
  stockName: string
  direction: 'buy' | 'sell'
  entryPrice: number
  targetPrice: number
  stopPrice: number
  positionSize: number
  reason: string
  status: 'pending' | 'executed' | 'cancelled'
  createdAt: string
}

const TradePlanTemplate: React.FC = () => {
  const [plans, setPlans] = useState<TradePlan[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    const saved = localStorage.getItem('tradePlans')
    if (saved) setPlans(JSON.parse(saved))
  }, [])

  const savePlans = (newPlans: TradePlan[]) => {
    setPlans(newPlans)
    localStorage.setItem('tradePlans', JSON.stringify(newPlans))
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        savePlans(plans.map((p) => p.id === editingId ? { ...p, ...values } : p))
      } else {
        const newPlan: TradePlan = {
          id: Date.now().toString(),
          ...values,
          status: 'pending',
          createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
        }
        savePlans([...plans, newPlan])
      }
      closeModal()
    })
  }

  const closeModal = () => {
    setModalVisible(false)
    setEditingId(null)
    form.resetFields()
  }

  const handleEdit = (plan: TradePlan) => {
    setEditingId(plan.id)
    form.setFieldsValue(plan)
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    savePlans(plans.filter((p) => p.id !== id))
  }

  const handleStatusChange = (id: string, status: TradePlan['status']) => {
    savePlans(plans.map((p) => p.id === id ? { ...p, status } : p))
  }

  const columns = [
    { title: '股票', dataIndex: 'stockName', key: 'stockName', width: 80 },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (v: string) => (
        <Tag color={v === 'buy' ? 'red' : 'green'}>{v === 'buy' ? '买入' : '卖出'}</Tag>
      ),
    },
    { title: '入场价', dataIndex: 'entryPrice', key: 'entryPrice' },
    { title: '目标价', dataIndex: 'targetPrice', key: 'targetPrice' },
    { title: '止损价', dataIndex: 'stopPrice', key: 'stopPrice' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: TradePlan['status'], r: TradePlan) => (
        <Select<TradePlan['status']>
          size="small"
          value={v}
          onChange={(val) => handleStatusChange(r.id, val)}
          options={[
            { label: '待执行', value: 'pending' },
            { label: '已执行', value: 'executed' },
            { label: '已取消', value: 'cancelled' },
          ]}
          style={{ width: 90 }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: TradePlan) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="交易计划"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建计划</Button>}
    >
      <Table columns={columns} dataSource={plans} rowKey="id" size="small" pagination={{ pageSize: 5 }} />

      <Modal title={editingId ? '编辑计划' : '新建计划'} open={modalVisible} onOk={handleSubmit} onCancel={closeModal} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如: 600519" />
          </Form.Item>
          <Form.Item name="stockName" label="股票名称" rules={[{ required: true }]}>
            <Input placeholder="如: 贵州茅台" />
          </Form.Item>
          <Form.Item name="direction" label="交易方向" rules={[{ required: true }]}>
            <Select options={[{ label: '买入', value: 'buy' }, { label: '卖出', value: 'sell' }]} />
          </Form.Item>
          <Form.Item name="entryPrice" label="入场价格" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="targetPrice" label="目标价格" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stopPrice" label="止损价格" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="positionSize" label="计划仓位(%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="交易理由">
            <TextArea rows={2} placeholder="描述交易理由" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default TradePlanTemplate
