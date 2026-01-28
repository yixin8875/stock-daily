import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Select, Rate, Button, Table, Modal, Tag, Space, Empty, Row, Col, Statistic } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input

interface ReviewTemplate {
  id: string
  date: string
  stockCode: string
  stockName: string
  tradeType: 'buy' | 'sell'
  entryReason: string
  exitReason: string
  marketCondition: string
  emotionState: number
  lessonsLearned: string
  improvement: string
  rating: number
}

const ReviewTemplateManager: React.FC = () => {
  const [data, setData] = useState<ReviewTemplate[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    const saved = localStorage.getItem('reviewTemplates')
    if (saved) setData(JSON.parse(saved))
  }, [])

  const saveData = (newData: ReviewTemplate[]) => {
    setData(newData)
    localStorage.setItem('reviewTemplates', JSON.stringify(newData))
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        saveData(data.map((d) => (d.id === editingId ? { ...d, ...values } : d)))
      } else {
        const newRecord: ReviewTemplate = {
          id: Date.now().toString(),
          date: dayjs().format('YYYY-MM-DD'),
          ...values,
        }
        saveData([...data, newRecord])
      }
      setModalVisible(false)
      setEditingId(null)
      form.resetFields()
    })
  }

  const handleEdit = (record: ReviewTemplate) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    saveData(data.filter((d) => d.id !== id))
  }

  const avgRating = data.length > 0 ? data.reduce((sum, d) => sum + d.rating, 0) / data.length : 0

  return (
    <Card
      title="交易复盘模板"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建复盘
        </Button>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="复盘总数" value={data.length} suffix="次" />
        </Col>
        <Col span={8}>
          <Statistic title="平均评分" value={avgRating.toFixed(1)} suffix="/ 5" />
        </Col>
        <Col span={8}>
          <Statistic title="本月复盘" value={data.filter((d) => dayjs(d.date).month() === dayjs().month()).length} suffix="次" />
        </Col>
      </Row>

      {data.length === 0 ? (
        <Empty description="暂无复盘记录" />
      ) : (
        <Table
          columns={[
            { title: '日期', dataIndex: 'date', key: 'date', width: 100 },
            { title: '股票', dataIndex: 'stockName', key: 'stockName', width: 80 },
            {
              title: '类型',
              dataIndex: 'tradeType',
              key: 'tradeType',
              render: (v: string) => <Tag color={v === 'buy' ? 'red' : 'green'}>{v === 'buy' ? '买入' : '卖出'}</Tag>,
            },
            { title: '评分', dataIndex: 'rating', key: 'rating', render: (v: number) => <Rate disabled value={v} /> },
            {
              title: '操作',
              key: 'action',
              render: (_: unknown, r: ReviewTemplate) => (
                <Space>
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
                </Space>
              ),
            },
          ]}
          dataSource={data}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
        />
      )}

      <Modal
        title={editingId ? '编辑复盘' : '新建复盘'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => { setModalVisible(false); setEditingId(null); form.resetFields() }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
                <Input placeholder="如: 600519" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stockName" label="股票名称" rules={[{ required: true }]}>
                <Input placeholder="如: 贵州茅台" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tradeType" label="交易类型" rules={[{ required: true }]}>
            <Select options={[{ label: '买入', value: 'buy' }, { label: '卖出', value: 'sell' }]} />
          </Form.Item>
          <Form.Item name="entryReason" label="入场理由" rules={[{ required: true }]}>
            <TextArea rows={2} placeholder="描述买入/卖出的理由" />
          </Form.Item>
          <Form.Item name="marketCondition" label="市场环境">
            <TextArea rows={2} placeholder="描述当时的市场环境" />
          </Form.Item>
          <Form.Item name="emotionState" label="情绪状态">
            <Rate />
          </Form.Item>
          <Form.Item name="lessonsLearned" label="经验教训">
            <TextArea rows={2} placeholder="这次交易学到了什么" />
          </Form.Item>
          <Form.Item name="improvement" label="改进方向">
            <TextArea rows={2} placeholder="下次如何改进" />
          </Form.Item>
          <Form.Item name="rating" label="交易评分" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default ReviewTemplateManager
