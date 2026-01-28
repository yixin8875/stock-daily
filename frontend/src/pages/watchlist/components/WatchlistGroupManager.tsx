import React, { useState, useEffect } from 'react'
import { Card, Tabs, Button, Modal, Form, Input, Tag, Space, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { watchlistService, type WatchlistGroup } from '@/services'

const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']

interface Props {
  onGroupChange?: (groupId: string | null) => void
}

const WatchlistGroupManager: React.FC<Props> = ({ onGroupChange }) => {
  const [groups, setGroups] = useState<WatchlistGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingGroup, setEditingGroup] = useState<WatchlistGroup | null>(null)
  const [activeKey, setActiveKey] = useState<string>('all')
  const [form] = Form.useForm()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await watchlistService.getGroups()
      setGroups(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editingGroup) {
        await watchlistService.updateGroup(editingGroup.id, values)
      } else {
        await watchlistService.createGroup(values)
      }
      fetchGroups()
      closeModal()
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除分组后，该分组下的股票将移至默认分组',
      onOk: async () => {
        await watchlistService.deleteGroup(id)
        fetchGroups()
        if (activeKey === id) {
          setActiveKey('all')
          onGroupChange?.(null)
        }
      },
    })
  }

  const closeModal = () => {
    setModalVisible(false)
    setEditingGroup(null)
    form.resetFields()
  }

  const handleEdit = (group: WatchlistGroup) => {
    setEditingGroup(group)
    form.setFieldsValue(group)
    setModalVisible(true)
  }

  const handleTabChange = (key: string) => {
    setActiveKey(key)
    onGroupChange?.(key === 'all' ? null : key)
  }

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Spin spinning={loading}>
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          tabBarExtraContent={
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              新建分组
            </Button>
          }
          items={[
            { key: 'all', label: '全部' },
            ...groups.map((g) => ({
              key: g.id,
              label: (
                <Space size={4}>
                  <Tag color={g.color}>{g.name}</Tag>
                  <span>({g.stockCount})</span>
                  <EditOutlined onClick={(e) => { e.stopPropagation(); handleEdit(g) }} />
                  <DeleteOutlined onClick={(e) => { e.stopPropagation(); handleDelete(g.id) }} />
                </Space>
              ),
            })),
          ]}
        />
      </Spin>

      <Modal
        title={editingGroup ? '编辑分组' : '新建分组'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={closeModal}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分组名称" rules={[{ required: true }]}>
            <Input placeholder="如: 科技股" />
          </Form.Item>
          <Form.Item name="color" label="颜色" initialValue={colors[0]}>
            <Space>
              {colors.map((c) => (
                <Tag
                  key={c}
                  color={c}
                  style={{ cursor: 'pointer', padding: '4px 12px' }}
                  onClick={() => form.setFieldValue('color', c)}
                >
                  {form.getFieldValue('color') === c ? '✓' : ' '}
                </Tag>
              ))}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default WatchlistGroupManager
