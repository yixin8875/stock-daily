import React, { useEffect, useState, useCallback } from 'react'
import {
  Card, Table, Button, Space, Typography, Tag, message, Modal, Form, Input,
  InputNumber, Select, Switch, Popconfirm, Empty, Spin, Tabs
} from 'antd'
import { PlusOutlined, DeleteOutlined, ReloadOutlined, BellOutlined } from '@ant-design/icons'
import { alertService, stockService, type PriceAlert, type AlertType, type StockQuote } from '@/services'
import { SmartStopLoss, PositionSizer, TradeExport, ReminderSettings, TechnicalIndicatorAlert, VolumeAlert, MAAlert } from './components'

const { Title, Text } = Typography

const alertTypeLabels: Record<AlertType, string> = {
  TAKE_PROFIT: '止盈',
  STOP_LOSS: '止损',
  PRICE_ABOVE: '价格高于',
  PRICE_BELOW: '价格低于',
  BREAKOUT: '突破',
  VOLATILITY: '波动',
  MACD: 'MACD',
  KDJ: 'KDJ',
  VOLUME: '成交量',
  MA: '均线',
}

const alertTypeColors: Record<AlertType, string> = {
  TAKE_PROFIT: 'red',
  STOP_LOSS: 'green',
  PRICE_ABOVE: 'blue',
  PRICE_BELOW: 'orange',
  BREAKOUT: 'purple',
  VOLATILITY: 'magenta',
  MACD: 'cyan',
  KDJ: 'geekblue',
  VOLUME: 'volcano',
  MA: 'lime',
}

const AlertPage: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [includeTriggered, setIncludeTriggered] = useState(false)
  const [form] = Form.useForm()

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const res = await alertService.getAlerts(includeTriggered)
      setAlerts(res.data.data || [])
    } catch (error) {
      message.error('获取提醒失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotes = useCallback(async () => {
    if (alerts.length === 0) return
    try {
      const codes = [...new Set(alerts.map(a => a.stockCode))]
      const res = await stockService.getQuotes(codes)
      const quotesMap: Record<string, StockQuote> = {}
      res.data.data?.forEach((q: StockQuote) => { quotesMap[q.code] = q })
      setQuotes(quotesMap)
    } catch (error) {
      console.error('获取行情失败:', error)
    }
  }, [alerts])

  useEffect(() => {
    fetchAlerts()
  }, [includeTriggered])

  useEffect(() => {
    fetchQuotes()
    const interval = setInterval(fetchQuotes, 10000)
    return () => clearInterval(interval)
  }, [fetchQuotes])

  const handleAdd = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await alertService.createAlert(values)
      message.success('添加成功')
      setModalVisible(false)
      fetchAlerts()
    } catch (error) {
      message.error('添加失败')
    }
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await alertService.updateAlert(id, { isEnabled })
      message.success(isEnabled ? '已启用' : '已禁用')
      fetchAlerts()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReset = async (id: string) => {
    try {
      await alertService.resetAlert(id)
      message.success('已重置')
      fetchAlerts()
    } catch (error) {
      message.error('重置失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await alertService.deleteAlert(id)
      message.success('删除成功')
      fetchAlerts()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: unknown, record: PriceAlert) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'alertType',
      key: 'alertType',
      render: (v: AlertType) => <Tag color={alertTypeColors[v]}>{alertTypeLabels[v]}</Tag>,
    },
    {
      title: '目标价',
      dataIndex: 'targetPrice',
      key: 'targetPrice',
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '现价',
      key: 'currentPrice',
      render: (_: unknown, record: PriceAlert) => {
        const quote = quotes[record.stockCode]
        if (!quote) return <Text type="secondary">--</Text>
        return `¥${quote.price.toFixed(2)}`
      },
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, record: PriceAlert) => {
        if (record.isTriggered) {
          return <Tag color="gold">已触发 {record.triggeredAt}</Tag>
        }
        return record.isEnabled ? <Tag color="green">监控中</Tag> : <Tag>已禁用</Tag>
      },
    },
    {
      title: '启用',
      key: 'enabled',
      render: (_: unknown, record: PriceAlert) => (
        <Switch
          checked={record.isEnabled}
          onChange={(checked) => handleToggle(record.id, checked)}
          disabled={record.isTriggered}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: PriceAlert) => (
        <Space>
          {record.isTriggered && (
            <Button type="text" icon={<ReloadOutlined />} onClick={() => handleReset(record.id)}>
              重置
            </Button>
          )}
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <BellOutlined style={{ marginRight: 8 }} />
        提醒与工具
      </Title>

      <Tabs defaultActiveKey="alerts" items={[
        {
          key: 'alerts',
          label: '价格提醒',
          children: <AlertsTab
            alerts={alerts}
            quotes={quotes}
            loading={loading}
            includeTriggered={includeTriggered}
            setIncludeTriggered={setIncludeTriggered}
            fetchQuotes={fetchQuotes}
            handleAdd={handleAdd}
            handleToggle={handleToggle}
            handleReset={handleReset}
            handleDelete={handleDelete}
            columns={columns}
          />
        },
        {
          key: 'stopLoss',
          label: '智能止盈止损',
          children: <SmartStopLoss />
        },
        {
          key: 'position',
          label: '仓位建议',
          children: <PositionSizer />
        },
        {
          key: 'export',
          label: '交易导出',
          children: <TradeExport />
        },
        {
          key: 'settings',
          label: '提醒设置',
          children: <ReminderSettings />
        },
        {
          key: 'technical',
          label: '技术指标',
          children: <TechnicalIndicatorAlert />
        },
        {
          key: 'volume',
          label: '成交量异动',
          children: <VolumeAlert />
        },
        {
          key: 'ma',
          label: '均线突破',
          children: <MAAlert />
        },
      ]} />

      <Modal title="添加价格提醒" open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如: 600000" />
          </Form.Item>
          <Form.Item name="stockName" label="股票名称" rules={[{ required: true }]}>
            <Input placeholder="如: 浦发银行" />
          </Form.Item>
          <Form.Item name="alertType" label="提醒类型" rules={[{ required: true }]}>
            <Select placeholder="选择提醒类型">
              <Select.Option value="TAKE_PROFIT">止盈</Select.Option>
              <Select.Option value="STOP_LOSS">止损</Select.Option>
              <Select.Option value="PRICE_ABOVE">价格高于</Select.Option>
              <Select.Option value="PRICE_BELOW">价格低于</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetPrice" label="目标价格" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// AlertsTab 子组件
const AlertsTab: React.FC<{
  alerts: PriceAlert[]
  quotes: Record<string, StockQuote>
  loading: boolean
  includeTriggered: boolean
  setIncludeTriggered: (v: boolean) => void
  fetchQuotes: () => void
  handleAdd: () => void
  handleToggle: (id: string, enabled: boolean) => void
  handleReset: (id: string) => void
  handleDelete: (id: string) => void
  columns: any[]
}> = ({ alerts, loading, includeTriggered, setIncludeTriggered, fetchQuotes, handleAdd, columns }) => (
  <>
    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
      <Space>
        <Switch
          checkedChildren="显示已触发"
          unCheckedChildren="隐藏已触发"
          checked={includeTriggered}
          onChange={setIncludeTriggered}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchQuotes}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加</Button>
      </Space>
    </div>
    <Card>
      <Spin spinning={loading}>
        {alerts.length > 0 ? (
          <Table columns={columns} dataSource={alerts} rowKey="id" pagination={false} />
        ) : (
          <Empty description="暂无价格提醒">
            <Button type="primary" onClick={handleAdd}>添加提醒</Button>
          </Empty>
        )}
      </Spin>
    </Card>
  </>
)

export default AlertPage
