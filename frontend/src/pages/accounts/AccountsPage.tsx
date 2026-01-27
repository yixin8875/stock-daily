import React, { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Tag,
  Typography,
  message,
  Popconfirm,
  ColorPicker,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  StarFilled,
} from '@ant-design/icons'
import { accountService } from '@/services'
import type { TradingAccount, CreateAccountParams } from '@/services'

const { Title, Text } = Typography

const AccountsPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null)
  const [form] = Form.useForm()

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const response = await accountService.getAccounts()
      setAccounts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
      message.error('获取账户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleAdd = () => {
    setEditingAccount(null)
    form.resetFields()
    form.setFieldsValue({ color: '#1890FF', isDefault: false })
    setModalVisible(true)
  }

  const handleEdit = (account: TradingAccount) => {
    setEditingAccount(account)
    form.setFieldsValue({
      name: account.name,
      broker: account.broker,
      accountNo: account.accountNo,
      initialAssets: account.initialAssets,
      currentAssets: account.currentAssets,
      color: account.color,
      notes: account.notes,
      isDefault: account.isDefault,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await accountService.deleteAccount(id)
      message.success('删除成功')
      fetchAccounts()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const color = typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#1890FF'

      const params: CreateAccountParams = {
        name: values.name,
        broker: values.broker,
        accountNo: values.accountNo,
        initialAssets: values.initialAssets,
        color,
        notes: values.notes,
        isDefault: values.isDefault,
      }

      if (editingAccount) {
        await accountService.updateAccount(editingAccount.id, {
          ...params,
          currentAssets: values.currentAssets,
        })
        message.success('更新成功')
      } else {
        await accountService.createAccount(params)
        message.success('创建成功')
      }

      setModalVisible(false)
      fetchAccounts()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const columns = [
    {
      title: '账户名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TradingAccount) => (
        <Space>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: record.color,
            }}
          />
          <Text strong>{name}</Text>
          {record.isDefault && (
            <Tag color="gold" icon={<StarFilled />}>
              默认
            </Tag>
          )}
          {!record.isActive && <Tag color="default">已停用</Tag>}
        </Space>
      ),
    },
    {
      title: '券商',
      dataIndex: 'broker',
      key: 'broker',
      render: (broker: string) => broker || '-',
    },
    {
      title: '初始资金',
      dataIndex: 'initialAssets',
      key: 'initialAssets',
      render: (value: number) => (value ? `¥${value.toLocaleString()}` : '-'),
    },
    {
      title: '当前资产',
      dataIndex: 'currentAssets',
      key: 'currentAssets',
      render: (value: number) => (value ? `¥${value.toLocaleString()}` : '-'),
    },
    {
      title: '收益',
      key: 'profit',
      render: (_: any, record: TradingAccount) => {
        if (!record.initialAssets || !record.currentAssets) return '-'
        const profit = Number(record.currentAssets) - Number(record.initialAssets)
        const rate = (profit / Number(record.initialAssets)) * 100
        return (
          <Space direction="vertical" size={0}>
            <Text style={{ color: profit >= 0 ? '#F5222D' : '#52C41A' }}>
              {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
            </Text>
          </Space>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TradingAccount) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除该账户吗？"
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

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          <BankOutlined style={{ marginRight: 8 }} />
          交易账户管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加账户
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingAccount ? '编辑账户' : '添加账户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="账户名称"
            rules={[{ required: true, message: '请输入账户名称' }]}
          >
            <Input placeholder="如：主账户、打新账户" />
          </Form.Item>

          <Form.Item name="broker" label="券商">
            <Input placeholder="如：华泰证券" />
          </Form.Item>

          <Form.Item name="accountNo" label="账户号">
            <Input placeholder="可选，用于区分多个账户" />
          </Form.Item>

          <Form.Item name="initialAssets" label="初始资金">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="账户初始资金"
              min={0}
              precision={2}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/¥\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          {editingAccount && (
            <Form.Item name="currentAssets" label="当前资产">
              <InputNumber
                style={{ width: '100%' }}
                placeholder="当前账户资产"
                min={0}
                precision={2}
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/¥\s?|(,*)/g, '') as any}
              />
            </Form.Item>
          )}

          <Form.Item name="color" label="颜色标识">
            <ColorPicker />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} placeholder="账户备注信息" />
          </Form.Item>

          <Form.Item name="isDefault" label="设为默认账户" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AccountsPage
