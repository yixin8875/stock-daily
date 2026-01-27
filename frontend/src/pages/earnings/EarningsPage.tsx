import React, { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Typography, Tag, message, Modal, Form, Input,
  DatePicker, Select, Popconfirm, Empty, Spin, Calendar, Badge
} from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { earningsService, type EarningsEvent } from '@/services'

const { Title, Text } = Typography

const reportTypes = [
  { value: '年报', label: '年报' },
  { value: '半年报', label: '半年报' },
  { value: '一季报', label: '一季报' },
  { value: '三季报', label: '三季报' },
]

const EarningsPage: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EarningsEvent | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [form] = Form.useForm()

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const res = await earningsService.getEarnings()
      setEarnings(res.data.data || [])
    } catch (error) {
      message.error('获取财报日历失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEarnings() }, [])

  const handleAdd = () => {
    setEditingEvent(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (event: EarningsEvent) => {
    setEditingEvent(event)
    form.setFieldsValue({
      ...event,
      reportDate: dayjs(event.reportDate),
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        reportDate: values.reportDate.format('YYYY-MM-DD'),
      }
      if (editingEvent) {
        await earningsService.updateEarnings(editingEvent.id, data)
        message.success('更新成功')
      } else {
        await earningsService.addEarnings(data)
        message.success('添加成功')
      }
      setModalVisible(false)
      fetchEarnings()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await earningsService.deleteEarnings(id)
      message.success('删除成功')
      fetchEarnings()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const getDateEarnings = (date: Dayjs) => {
    return earnings.filter(e => dayjs(e.reportDate).isSame(date, 'day'))
  }

  const dateCellRender = (date: Dayjs) => {
    const dayEarnings = getDateEarnings(date)
    if (dayEarnings.length === 0) return null
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayEarnings.map(e => (
          <li key={e.id}>
            <Badge status="warning" text={`${e.stockName} ${e.reportType}`} />
          </li>
        ))}
      </ul>
    )
  }

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: unknown, record: EarningsEvent) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </Space>
      ),
    },
    {
      title: '发布日期',
      dataIndex: 'reportDate',
      key: 'reportDate',
      render: (v: string) => {
        const date = dayjs(v)
        const isUpcoming = date.isAfter(dayjs())
        const daysLeft = date.diff(dayjs(), 'day')
        return (
          <Space direction="vertical" size={0}>
            <Text>{date.format('YYYY-MM-DD')}</Text>
            {isUpcoming && <Tag color="orange">{daysLeft}天后</Tag>}
          </Space>
        )
      },
      sorter: (a: EarningsEvent, b: EarningsEvent) => dayjs(a.reportDate).unix() - dayjs(b.reportDate).unix(),
    },
    {
      title: '报告类型',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (v: string | null) => v || <Text type="secondary">--</Text>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: EarningsEvent) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>财报日历</Title>
        <Space>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            {viewMode === 'list' ? '日历视图' : '列表视图'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加财报</Button>
        </Space>
      </div>

      <Card>
        <Spin spinning={loading}>
          {viewMode === 'list' ? (
            earnings.length > 0 ? (
              <Table columns={columns} dataSource={earnings} rowKey="id" pagination={{ pageSize: 10 }} />
            ) : (
              <Empty description="暂无财报日程">
                <Button type="primary" onClick={handleAdd}>添加财报</Button>
              </Empty>
            )
          ) : (
            <Calendar cellRender={dateCellRender} />
          )}
        </Spin>
      </Card>

      <Modal
        title={editingEvent ? '编辑财报' : '添加财报'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如: 600000" />
          </Form.Item>
          <Form.Item name="stockName" label="股票名称" rules={[{ required: true }]}>
            <Input placeholder="如: 浦发银行" />
          </Form.Item>
          <Form.Item name="reportDate" label="发布日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reportType" label="报告类型" rules={[{ required: true }]}>
            <Select options={reportTypes} placeholder="选择报告类型" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default EarningsPage
