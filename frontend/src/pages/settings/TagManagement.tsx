import React, { useEffect, useState } from 'react'
import {
  Typography,
  Tabs,
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Empty,
  Spin,
  ColorPicker,
} from 'antd'
import type { Color } from 'antd/es/color-picker'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useTagStore } from '@/stores/tagStore'
import type { Tag as TagType, TagCategory, CreateTagParams, UpdateTagParams } from '@/types/tag'
import { TAG_CATEGORIES, TAG_CATEGORY_LABELS, PRESET_COLORS } from '@/types/tag'

const { Title } = Typography

interface TagFormValues {
  name: string
  color: string
  category: TagCategory
}

const TagManagement: React.FC = () => {
  const {
    tags,
    tagsByCategory,
    loading,
    initialized,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    initTags,
  } = useTagStore()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [form] = Form.useForm<TagFormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  // 首次访问且没有标签时自动初始化
  useEffect(() => {
    if (initialized && tags.length === 0) {
      initTags()
    }
  }, [initialized, tags.length, initTags])

  // 获取当前显示的标签
  const getDisplayTags = (): TagType[] => {
    if (activeTab === 'all') {
      return tags
    }
    return tagsByCategory[activeTab as TagCategory] || []
  }

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingTag(null)
    form.resetFields()
    form.setFieldsValue({
      color: PRESET_COLORS[0],
      category: 'custom',
    })
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (tag: TagType) => {
    setEditingTag(tag)
    form.setFieldsValue({
      name: tag.name,
      color: tag.color,
      category: tag.category,
    })
    setModalVisible(true)
  }

  // 删除标签
  const handleDelete = async (id: number) => {
    await deleteTag(id)
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      let success: boolean
      if (editingTag) {
        // 编辑模式只能修改名称和颜色
        const params: UpdateTagParams = {
          name: values.name,
          color: values.color,
        }
        success = await updateTag(editingTag.id, params)
      } else {
        // 创建模式
        const params: CreateTagParams = {
          name: values.name,
          color: values.color,
          category: values.category,
        }
        success = await createTag(params)
      }

      if (success) {
        setModalVisible(false)
        form.resetFields()
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '标签',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TagType) => (
        <Tag color={record.color}>{name}</Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: TagCategory) => TAG_CATEGORY_LABELS[category],
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: TagType) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除这个标签吗?"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // Tab项
  const tabItems = [
    { key: 'all', label: '全部' },
    ...TAG_CATEGORIES.map(cat => ({
      key: cat.value,
      label: `${cat.label} (${tagsByCategory[cat.value]?.length || 0})`,
    })),
  ]

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      }}>
        <Title level={3} style={{ margin: 0 }}>标签管理</Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchTags()}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建标签
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        <Spin spinning={loading}>
          {getDisplayTags().length > 0 ? (
            <Table
              columns={columns}
              dataSource={getDisplayTags()}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 个标签`,
              }}
            />
          ) : (
            <Empty
              description="暂无标签"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={handleCreate}>
                创建第一个标签
              </Button>
            </Empty>
          )}
        </Spin>
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            color: PRESET_COLORS[0],
            category: 'custom',
          }}
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[
              { required: true, message: '请输入标签名称' },
              { max: 20, message: '标签名称不能超过20个字符' },
            ]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>

          <Form.Item
            name="color"
            label="标签颜色"
            rules={[{ required: true, message: '请选择标签颜色' }]}
            getValueFromEvent={(color: Color) => color.toHexString()}
          >
            <ColorPicker
              presets={[
                {
                  label: '预设颜色',
                  colors: PRESET_COLORS as unknown as string[],
                },
              ]}
              showText
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="标签分类"
            rules={[{ required: true, message: '请选择标签分类' }]}
          >
            <Select
              placeholder="请选择标签分类"
              disabled={!!editingTag}
              options={TAG_CATEGORIES.map(cat => ({
                label: cat.label,
                value: cat.value,
              }))}
            />
          </Form.Item>

          {/* 预览 */}
          <Form.Item label="预览" shouldUpdate>
            {() => {
              const name = form.getFieldValue('name')
              const color = form.getFieldValue('color')
              if (!name) return <span style={{ color: '#999' }}>输入名称后预览</span>
              return <Tag color={color}>{name}</Tag>
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TagManagement