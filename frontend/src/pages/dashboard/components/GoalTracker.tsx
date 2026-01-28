import React, { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Button, List, Progress, Modal, Tag, message, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { goalService, type InvestmentGoal } from '@/services'

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<InvestmentGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await goalService.getAll()
      setGoals(res.data.data || [])
    } catch {
      message.error('获取目标失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleAdd = async () => {
    try {
      const values = await form.validateFields()
      await goalService.create({
        title: values.title,
        targetValue: values.targetAmount,
        deadline: values.deadline,
        category: 'profit',
      })
      message.success('创建成功')
      setModalVisible(false)
      form.resetFields()
      fetchGoals()
    } catch {
      message.error('创建失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await goalService.delete(id)
      message.success('删除成功')
      fetchGoals()
    } catch {
      message.error('删除失败')
    }
  }

  const handleUpdate = async (id: string, amount: number) => {
    try {
      await goalService.update(id, { currentValue: amount })
      setGoals(goals.map(g => g.id === id ? { ...g, currentValue: amount } : g))
    } catch {
      message.error('更新失败')
    }
  }

  return (
    <Card
      title="目标追踪器"
      extra={<Button type="primary" icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}>新建目标</Button>}
    >
      <Spin spinning={loading}>
        <List
          dataSource={goals}
          renderItem={(goal) => {
            const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100)
            return (
              <List.Item
                actions={[
                  <InputNumber
                    key="input"
                    size="small"
                    value={goal.currentValue}
                    onChange={(v) => handleUpdate(goal.id, v || 0)}
                    style={{ width: 100 }}
                  />,
                  <Button key="del" type="link" danger icon={<DeleteOutlined />}
                    onClick={() => handleDelete(goal.id)} />,
                ]}
              >
                <List.Item.Meta
                  title={<>{goal.title} {goal.deadline && <Tag>{goal.deadline.slice(0, 10)}</Tag>}</>}
                  description={
                    <Progress
                      percent={percent}
                      format={() => `${goal.currentValue}/${goal.targetValue}`}
                      status={percent >= 100 ? 'success' : 'active'}
                    />
                  }
                />
              </List.Item>
            )
          }}
        />
      </Spin>

      <Modal title="新建目标" open={modalVisible}
        onOk={handleAdd} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="目标名称" rules={[{ required: true }]}>
            <Input placeholder="如: 年度收益10万" />
          </Form.Item>
          <Form.Item name="targetAmount" label="目标值" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="deadline" label="截止日期" rules={[{ required: true }]}>
            <Input placeholder="如: 2025-12-31" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default GoalTracker
