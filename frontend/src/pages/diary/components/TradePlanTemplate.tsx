import React, { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Select, Button, Table, Modal, Tag, Space, message } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { tradePlanTemplateService, type TradePlanTemplate as TradePlan } from '@/services'

const { TextArea } = Input

const TradePlanTemplate: React.FC = () => {
  const [plans, setPlans] = useState<TradePlan[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  const fetchPlans = async () => {
    try {
      const res = await tradePlanTemplateService.getAll()
      if (res.data.success && res.data.data) {
        setPlans(res.data.data)
      }
    } catch (error) {
      console.error('加载交易计划失败:', error)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingId) {
        await tradePlanTemplateService.update(editingId, values)
        message.success('更新成功')
      } else {
        await tradePlanTemplateService.create(values)
        message.success('创建成功')
      }
      closeModal()
      fetchPlans()
    } catch (error) {
      message.error('操作失败')
    }
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

  const handleDelete = async (id: string) => {
    try {
      await tradePlanTemplateService.delete(id)
      message.success('删除成功')
      fetchPlans()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleStatusChange = async (id: string, status: TradePlan['status']) => {
    try {
      await tradePlanTemplateService.update(id, { status })
      fetchPlans()
    } catch (error) {
      message.error('更新状态失败')
    }
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
