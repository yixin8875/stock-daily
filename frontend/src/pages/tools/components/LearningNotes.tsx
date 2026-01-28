import React, { useState, useEffect } from 'react'
import { Card, Input, Button, List, Tag, Modal, Form, Select, Empty, Space } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input

interface LearningNote {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const categories = [
  { label: '技术分析', value: 'technical' },
  { label: '基本面', value: 'fundamental' },
  { label: '交易心理', value: 'psychology' },
  { label: '风险管理', value: 'risk' },
  { label: '策略研究', value: 'strategy' },
]

const LearningNotes: React.FC = () => {
  const [notes, setNotes] = useState<LearningNote[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [form] = Form.useForm()

  useEffect(() => {
    const saved = localStorage.getItem('learningNotes')
    if (saved) setNotes(JSON.parse(saved))
  }, [])

  const saveNotes = (newNotes: LearningNote[]) => {
    setNotes(newNotes)
    localStorage.setItem('learningNotes', JSON.stringify(newNotes))
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const now = dayjs().format('YYYY-MM-DD HH:mm')
      if (editingId) {
        saveNotes(notes.map((n) => n.id === editingId ? { ...n, ...values, updatedAt: now } : n))
      } else {
        saveNotes([...notes, { id: Date.now().toString(), ...values, createdAt: now, updatedAt: now }])
      }
      closeModal()
    })
  }

  const closeModal = () => {
    setModalVisible(false)
    setEditingId(null)
    form.resetFields()
  }

  const handleEdit = (note: LearningNote) => {
    setEditingId(note.id)
    form.setFieldsValue(note)
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id))
  }

  const filteredNotes = notes.filter((n) => {
    const matchSearch = !searchText || n.title.includes(searchText) || n.content.includes(searchText)
    const matchCategory = !filterCategory || n.category === filterCategory
    return matchSearch && matchCategory
  })

  return (
    <Card
      title="学习笔记"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建笔记</Button>}
    >
      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Input
          placeholder="搜索笔记"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="分类筛选"
          options={[{ label: '全部', value: '' }, ...categories]}
          value={filterCategory}
          onChange={setFilterCategory}
          style={{ width: 120 }}
        />
      </Space>

      {filteredNotes.length === 0 ? (
        <Empty description="暂无笔记" />
      ) : (
        <List
          dataSource={filteredNotes}
          renderItem={(note) => (
            <List.Item
              actions={[
                <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(note)} />,
                <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(note.id)} />,
              ]}
            >
              <List.Item.Meta
                title={note.title}
                description={
                  <Space direction="vertical" size={4}>
                    <span>{note.content.slice(0, 100)}...</span>
                    <Space>
                      <Tag color="blue">{categories.find((c) => c.value === note.category)?.label}</Tag>
                      {note.tags?.map((t) => <Tag key={t}>{t}</Tag>)}
                      <span style={{ color: '#999', fontSize: 12 }}>{note.updatedAt}</span>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal title={editingId ? '编辑笔记' : '新建笔记'} open={modalVisible} onOk={handleSubmit} onCancel={closeModal} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="笔记标题" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select options={categories} placeholder="选择分类" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <TextArea rows={6} placeholder="笔记内容" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后回车" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default LearningNotes
