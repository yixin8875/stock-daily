import React, { useState, useEffect } from 'react'
import { Card, Calendar, Badge, Modal, Form, Input, DatePicker, Select, Button, List, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'earnings' | 'dividend' | 'ipo' | 'meeting' | 'custom'
  description?: string
}

const eventTypes = [
  { label: '财报发布', value: 'earnings', color: 'blue' },
  { label: '分红派息', value: 'dividend', color: 'green' },
  { label: 'IPO申购', value: 'ipo', color: 'red' },
  { label: '股东大会', value: 'meeting', color: 'orange' },
  { label: '自定义', value: 'custom', color: 'purple' },
]

const CalendarEvents: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [form] = Form.useForm()

  useEffect(() => {
    const saved = localStorage.getItem('calendarEvents')
    if (saved) setEvents(JSON.parse(saved))
  }, [])

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents)
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents))
  }

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        date: values.date.format('YYYY-MM-DD'),
        title: values.title,
        type: values.type,
        description: values.description,
      }
      saveEvents([...events, newEvent])
      setModalVisible(false)
      form.resetFields()
    })
  }

  const handleDelete = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id))
  }

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    return events.filter((e) => e.date === dateStr)
  }

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value)
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.slice(0, 2).map((item) => {
          const typeInfo = eventTypes.find((t) => t.value === item.type)
          return (
            <li key={item.id}>
              <Badge color={typeInfo?.color} text={item.title} />
            </li>
          )
        })}
        {listData.length > 2 && <li>+{listData.length - 2}...</li>}
      </ul>
    )
  }

  const onSelect = (date: Dayjs) => {
    setSelectedDate(date)
  }

  const dayEvents = getListData(selectedDate)

  return (
    <Card
      title="交易日历"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => {
        form.setFieldValue('date', selectedDate)
        setModalVisible(true)
      }}>添加事件</Button>}
    >
      <Calendar cellRender={dateCellRender} onSelect={onSelect} />

      {dayEvents.length > 0 && (
        <Card size="small" title={`${selectedDate.format('YYYY-MM-DD')} 事件`} style={{ marginTop: 16 }}>
          <List
            dataSource={dayEvents}
            renderItem={(item) => {
              const typeInfo = eventTypes.find((t) => t.value === item.type)
              return (
                <List.Item
                  actions={[<Button type="link" danger onClick={() => handleDelete(item.id)}>删除</Button>]}
                >
                  <List.Item.Meta
                    title={<><Tag color={typeInfo?.color}>{typeInfo?.label}</Tag>{item.title}</>}
                    description={item.description}
                  />
                </List.Item>
              )
            }}
          />
        </Card>
      )}

      <Modal title="添加事件" open={modalVisible} onOk={handleAdd} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={eventTypes} />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="事件标题" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default CalendarEvents
