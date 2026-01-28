import React, { useState } from 'react'
import { Card, Form, TimePicker, Checkbox, Switch, Button, message, Space } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const weekDays = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
]

const ReminderSettings: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const values = form.getFieldsValue()
      // 保存到 localStorage
      localStorage.setItem('reviewReminder', JSON.stringify({
        isEnabled: values.isEnabled,
        reminderTime: values.reminderTime?.format('HH:mm'),
        reminderDays: values.reminderDays,
      }))
      message.success('设置已保存')
    } catch {
      message.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title={<><BellOutlined style={{ marginRight: 8 }} />提醒设置</>}>
      <Form form={form} layout="vertical" initialValues={{
        isEnabled: true,
        reminderTime: dayjs('18:00', 'HH:mm'),
        reminderDays: [1, 2, 3, 4, 5],
      }}>
        <ReviewReminderForm />
        <VolatilityAlertForm />
        <Form.Item>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

// 异常波动提醒表单
const VolatilityAlertForm: React.FC = () => (
  <Card type="inner" title="异常波动预警" style={{ marginBottom: 16 }}>
    <Form.Item name="volatilityEnabled" label="启用波动预警" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item name="volatilityThreshold" label="波动阈值" initialValue={5}>
      <Space>
        <input type="number" defaultValue={5} style={{ width: 80 }} /> %
      </Space>
    </Form.Item>
  </Card>
)

// 复盘提醒表单
const ReviewReminderForm: React.FC = () => (
  <Card type="inner" title="定时复盘提醒" style={{ marginBottom: 16 }}>
    <Form.Item name="isEnabled" label="启用复盘提醒" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item name="reminderTime" label="提醒时间">
      <TimePicker format="HH:mm" />
    </Form.Item>
    <Form.Item name="reminderDays" label="提醒日期">
      <Checkbox.Group options={weekDays} />
    </Form.Item>
  </Card>
)

export default ReminderSettings
