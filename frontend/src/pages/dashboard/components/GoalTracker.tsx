import React, { useState, useEffect } from 'react'
import { Card, Form, Input, InputNumber, Button, List, Progress, Modal, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: string
  type: 'profit' | 'asset' | 'winrate'
}

const GoalTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const saved = localStorage.getItem('investGoals')
    if (saved) setGoals(JSON.parse(saved))
  }, [])

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals)
    localStorage.setItem('investGoals', JSON.stringify(newGoals))
  }

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...values,
        currentAmount: 0,
      }
      saveGoals([...goals, newGoal])
      setModalVisible(false)
      form.resetFields()
    })
  }

  const handleDelete = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id))
  }

  const handleUpdate = (id: string, amount: number) => {
    saveGoals(goals.map((g) =>
      g.id === id ? { ...g, currentAmount: amount } : g
    ))
  }

  return (
    <Card
      title="目标追踪器"
      extra={<Button type="primary" icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}>新建目标</Button>}
    >
      <List
        dataSource={goals}
        renderItem={(goal) => {
          const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
          return (
            <List.Item
              actions={[
                <InputNumber
                  key="input"
                  size="small"
                  value={goal.currentAmount}
                  onChange={(v) => handleUpdate(goal.id, v || 0)}
                  style={{ width: 100 }}
                />,
                <Button key="del" type="link" danger icon={<DeleteOutlined />}
                  onClick={() => handleDelete(goal.id)} />,
              ]}
            >
              <List.Item.Meta
                title={<>{goal.title} <Tag>{goal.deadline}</Tag></>}
                description={
                  <Progress
                    percent={percent}
                    format={() => `${goal.currentAmount}/${goal.targetAmount}`}
                    status={percent >= 100 ? 'success' : 'active'}
                  />
                }
              />
            </List.Item>
          )
        }}
      />

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
