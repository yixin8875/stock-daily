import React, { useState, useEffect } from 'react'
import { Card, List, Button, Modal, Form, Input, DatePicker, Rate, Tag, Space, Empty, Spin, message, Popconfirm } from 'antd'
import type { FormInstance } from 'antd'
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { journalService, type TradingJournal } from '@/services'

const { TextArea } = Input

// 日记列表子组件
const JournalList: React.FC<{
  journals: TradingJournal[]
  onEdit: (j: TradingJournal) => void
  onDelete: (id: string) => void
}> = ({ journals, onEdit, onDelete }) => (
  <List
    dataSource={journals}
    renderItem={item => (
      <List.Item
        actions={[
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(item)}>编辑</Button>,
          <Popconfirm title="确定删除?" onConfirm={() => onDelete(item.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ]}
      >
        <List.Item.Meta
          title={<Space><span>{item.date}</span><Rate disabled value={item.emotionScore} style={{ fontSize: 14 }} /></Space>}
          description={
            <div>
              <p><strong>市场观察:</strong> {item.marketObservation?.slice(0, 100)}...</p>
              {item.tags?.map(t => <Tag key={t}>{t}</Tag>)}
            </div>
          }
        />
      </List.Item>
    )}
  />
)

// 日记编辑弹窗
const JournalModal: React.FC<{
  visible: boolean
  form: FormInstance
  editing: boolean
  onOk: () => void
  onCancel: () => void
}> = ({ visible, form, editing, onOk, onCancel }) => (
  <Modal title={editing ? '编辑日记' : '写日记'} open={visible} onOk={onOk} onCancel={onCancel} width={600}>
    <Form form={form} layout="vertical">
      <Form.Item name="date" label="日期" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="emotionScore" label="今日情绪">
        <Rate />
      </Form.Item>
      <Form.Item name="marketObservation" label="市场观察" rules={[{ required: true }]}>
        <TextArea rows={3} placeholder="今日市场整体表现、热点板块..." />
      </Form.Item>
      <Form.Item name="tradingThoughts" label="交易思考">
        <TextArea rows={3} placeholder="今日交易决策的思考过程..." />
      </Form.Item>
      <Form.Item name="lessonsLearned" label="经验教训">
        <TextArea rows={3} placeholder="今日交易的收获和教训..." />
      </Form.Item>
    </Form>
  </Modal>
)

const TradingJournalPage: React.FC = () => {
  const [journals, setJournals] = useState<TradingJournal[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingJournal, setEditingJournal] = useState<TradingJournal | null>(null)
  const [form] = Form.useForm()

  useEffect(() => { fetchJournals() }, [])

  const fetchJournals = async () => {
    setLoading(true)
    try {
      const res = await journalService.getJournals({ limit: 50 })
      setJournals(res.data.data?.data || [])
    } catch { setJournals([]) }
    finally { setLoading(false) }
  }

  const handleAdd = () => {
    setEditingJournal(null)
    form.resetFields()
    form.setFieldsValue({ date: dayjs(), emotionScore: 3 })
    setModalVisible(true)
  }

  const handleEdit = (journal: TradingJournal) => {
    setEditingJournal(journal)
    form.setFieldsValue({
      ...journal,
      date: dayjs(journal.date),
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = { ...values, date: values.date.format('YYYY-MM-DD') }
      if (editingJournal) {
        await journalService.updateJournal(editingJournal.id, data)
        message.success('更新成功')
      } else {
        await journalService.saveJournal(data)
        message.success('保存成功')
      }
      setModalVisible(false)
      fetchJournals()
    } catch { message.error('保存失败') }
  }

  const handleDelete = async (id: string) => {
    try {
      await journalService.deleteJournal(id)
      message.success('删除成功')
      fetchJournals()
    } catch { message.error('删除失败') }
  }

  return (
    <Card
      title={<><EditOutlined style={{ marginRight: 8 }} />交易日记</>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>写日记</Button>}
    >
      <Spin spinning={loading}>
        {journals.length > 0 ? (
          <JournalList journals={journals} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <Empty description="暂无日记"><Button type="primary" onClick={handleAdd}>写第一篇</Button></Empty>
        )}
      </Spin>
      <JournalModal visible={modalVisible} form={form} editing={!!editingJournal} onOk={handleSubmit} onCancel={() => setModalVisible(false)} />
    </Card>
  )
}

export default TradingJournalPage
