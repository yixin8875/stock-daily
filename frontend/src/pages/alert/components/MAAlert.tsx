import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Switch, Modal, Form, Select, message, Popconfirm, Empty } from 'antd'
import { StockOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { alertService, type TechnicalAlert, type TechnicalAlertInput } from '@/services'
import { StockSearch } from '@/components'

const alertTypeLabels: Record<string, string> = {
  MA_BREAK_UP: '向上突破',
  MA_BREAK_DOWN: '向下突破',
}

const alertTypeColors: Record<string, string> = {
  MA_BREAK_UP: 'green',
  MA_BREAK_DOWN: 'red',
}

const MAAlert: React.FC = () => {
  const [alerts, setAlerts] = useState<TechnicalAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [stockCode, setStockCode] = useState('')
  const [stockName, setStockName] = useState('')

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const res = await alertService.getTechnicalAlerts(true)
      const filtered = (res.data.data || []).filter(a =>
        ['MA_BREAK_UP', 'MA_BREAK_DOWN'].includes(a.alertType)
      )
      setAlerts(filtered)
    } catch {
      message.error('获取提醒失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    form.resetFields()
    setStockCode('')
    setStockName('')
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data: TechnicalAlertInput = {
        stockCode,
        stockName,
        alertType: values.alertType,
        maType: values.maType,
      }
      await alertService.createTechnicalAlert(data)
      message.success('添加成功')
      setModalVisible(false)
      fetchAlerts()
    } catch {
      message.error('添加失败')
    }
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await alertService.updateTechnicalAlert(id, { isEnabled })
      message.success(isEnabled ? '已启用' : '已禁用')
      fetchAlerts()
    } catch {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await alertService.deleteTechnicalAlert(id)
      message.success('删除成功')
      fetchAlerts()
    } catch {
      message.error('删除失败')
    }
  }

  const handleReset = async (id: string) => {
    try {
      await alertService.resetTechnicalAlert(id)
      message.success('已重置')
      fetchAlerts()
    } catch {
      message.error('重置失败')
    }
  }

  const columns = [
    {
      title: '股票', key: 'stock',
      render: (_: unknown, r: TechnicalAlert) => (
        <><div>{r.stockName}</div><div style={{ fontSize: 12, color: '#999' }}>{r.stockCode}</div></>
      )
    },
    {
      title: '均线', dataIndex: 'maType', key: 'maType',
      render: (v: string) => <Tag>{v || 'MA20'}</Tag>
    },
    {
      title: '类型', dataIndex: 'alertType', key: 'alertType',
      render: (v: string) => <Tag color={alertTypeColors[v]}>{alertTypeLabels[v]}</Tag>
    },
    {
      title: '状态', key: 'status',
      render: (_: unknown, r: TechnicalAlert) => r.isTriggered
        ? <Tag color="gold">已触发 {r.triggeredAt}</Tag>
        : r.isEnabled ? <Tag color="green">监控中</Tag> : <Tag>已禁用</Tag>
    },
    {
      title: '启用', key: 'enabled',
      render: (_: unknown, r: TechnicalAlert) => (
        <Switch checked={r.isEnabled} onChange={c => handleToggle(r.id, c)} disabled={r.isTriggered} />
      )
    },
    {
      title: '操作', key: 'action',
      render: (_: unknown, r: TechnicalAlert) => (
        <Space>
          {r.isTriggered && <Button type="text" icon={<ReloadOutlined />} onClick={() => handleReset(r.id)}>重置</Button>}
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(r.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ]

  return (
    <Card
      title={<><StockOutlined style={{ marginRight: 8 }} />均线突破提醒</>}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加</Button>}
    >
      {alerts.length > 0 ? (
        <Table columns={columns} dataSource={alerts} rowKey="id" loading={loading} pagination={false} />
      ) : (
        <Empty description="暂无均线提醒"><Button type="primary" onClick={handleAdd}>添加提醒</Button></Empty>
      )}

      <Modal title="添加均线突破提醒" open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item label="股票" required>
            <StockSearch onChange={(c, n) => { setStockCode(c); setStockName(n) }} />
          </Form.Item>
          <Form.Item name="maType" label="均线类型" rules={[{ required: true }]}>
            <Select placeholder="选择均线">
              <Select.Option value="MA5">MA5 (5日均线)</Select.Option>
              <Select.Option value="MA10">MA10 (10日均线)</Select.Option>
              <Select.Option value="MA20">MA20 (20日均线)</Select.Option>
              <Select.Option value="MA60">MA60 (60日均线)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="alertType" label="突破方向" rules={[{ required: true }]}>
            <Select placeholder="选择突破方向">
              <Select.Option value="MA_BREAK_UP">向上突破</Select.Option>
              <Select.Option value="MA_BREAK_DOWN">向下突破</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default MAAlert
