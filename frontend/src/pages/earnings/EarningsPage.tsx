import React, { useEffect, useState, useMemo } from 'react'
import {
  Card, Table, Button, Space, Typography, Tag, message, Modal, Form, Input,
  DatePicker, Select, Popconfirm, Empty, Spin, Calendar, Badge, Row, Col, Statistic, Alert
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, EditOutlined, CalendarOutlined,
  BellOutlined, UnorderedListOutlined
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { earningsService, type EarningsEvent } from '@/services'
import { StockSearch } from '@/components'

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
  const [filterType, setFilterType] = useState<string | null>(null)

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

  // 统计数据
  const stats = useMemo(() => {
    const now = dayjs()
    const upcoming = earnings.filter(e => dayjs(e.reportDate).isAfter(now))
    const thisWeek = upcoming.filter(e => dayjs(e.reportDate).diff(now, 'day') <= 7)
    const thisMonth = upcoming.filter(e => dayjs(e.reportDate).diff(now, 'day') <= 30)
    return {
      total: earnings.length,
      upcoming: upcoming.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
    }
  }, [earnings])

  // 即将发布的财报（7天内）
  const upcomingEarnings = useMemo(() => {
    const now = dayjs()
    return earnings
      .filter(e => {
        const date = dayjs(e.reportDate)
        return date.isAfter(now) && date.diff(now, 'day') <= 7
      })
      .sort((a, b) => dayjs(a.reportDate).unix() - dayjs(b.reportDate).unix())
  }, [earnings])

  // 筛选后的数据
  const filteredEarnings = useMemo(() => {
    if (!filterType) return earnings
    return earnings.filter(e => e.reportType === filterType)
  }, [earnings, filterType])

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
        <Title level={3} style={{ margin: 0 }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          财报日历
        </Title>
        <Space>
          <Button
            icon={viewMode === 'list' ? <CalendarOutlined /> : <UnorderedListOutlined />}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            {viewMode === 'list' ? '日历视图' : '列表视图'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加财报</Button>
        </Space>
      </div>

      {/* 即将发布提醒 */}
      {upcomingEarnings.length > 0 && (
        <Alert
          type="warning"
          icon={<BellOutlined />}
          message={`${upcomingEarnings.length} 只股票将在7天内发布财报`}
          description={
            <Space wrap style={{ marginTop: 8 }}>
              {upcomingEarnings.map(e => (
                <Tag key={e.id} color="orange">
                  {e.stockName} - {dayjs(e.reportDate).format('MM/DD')} ({e.reportType})
                </Tag>
              ))}
            </Space>
          }
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="财报总数" value={stats.total} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="待发布" value={stats.upcoming} valueStyle={{ color: '#1890ff' }} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="本周发布" value={stats.thisWeek} valueStyle={{ color: '#faad14' }} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="本月发布" value={stats.thisMonth} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <span>财报列表</span>
            <Select
              allowClear
              placeholder="按类型筛选"
              style={{ width: 120 }}
              value={filterType}
              onChange={setFilterType}
              options={reportTypes}
            />
          </Space>
        }
      >
        <Spin spinning={loading}>
          {viewMode === 'list' ? (
            filteredEarnings.length > 0 ? (
              <Table columns={columns} dataSource={filteredEarnings} rowKey="id" pagination={{ pageSize: 10 }} />
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
          {!editingEvent && (
            <Form.Item label="搜索股票" required>
              <StockSearch
                placeholder="输入股票代码或名称搜索"
                onChange={(code, name) => {
                  form.setFieldsValue({ stockCode: code, stockName: name })
                }}
              />
            </Form.Item>
          )}
          <Form.Item name="stockCode" hidden><input /></Form.Item>
          <Form.Item name="stockName" hidden><input /></Form.Item>
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
