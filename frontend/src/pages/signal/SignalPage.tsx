import React, { useEffect, useState, useMemo } from 'react'
import {
  Card, List, Button, Space, Typography, Tag, message, Empty, Spin, Badge, Switch,
  Modal, Form, Input, InputNumber, Select, Row, Col, Statistic, Popconfirm
} from 'antd'
import {
  BellOutlined, CheckOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  PlusOutlined, FilterOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { signalService, type TradeSignal, type SignalType, type SignalDirection } from '@/services'
import { StockSearch } from '@/components'

const { Title, Text } = Typography

const signalTypeLabels: Record<SignalType, string> = {
  MA_CROSS: '均线交叉',
  MACD_CROSS: 'MACD交叉',
  KDJ_SIGNAL: 'KDJ信号',
  RSI_SIGNAL: 'RSI信号',
  VOLUME_BREAK: '放量突破',
  PRICE_BREAK: '价格突破',
  CUSTOM: '自定义',
}

const SignalPage: React.FC = () => {
  const [signals, setSignals] = useState<TradeSignal[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [filterType, setFilterType] = useState<SignalType | null>(null)
  const [filterDirection, setFilterDirection] = useState<SignalDirection | null>(null)
  const [form] = Form.useForm()

  const fetchSignals = async () => {
    setLoading(true)
    try {
      const res = await signalService.getSignals(unreadOnly)
      setSignals(res.data.data || [])
    } catch (error) {
      message.error('获取信号失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSignals() }, [unreadOnly])

  const handleAddSignal = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await signalService.createSignal(values)
      message.success('创建成功')
      setModalVisible(false)
      fetchSignals()
    } catch (error) {
      message.error('创建失败')
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await signalService.markAsRead(id)
      fetchSignals()
    } catch (error) {
      message.error('标记失败')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await signalService.markAllAsRead()
      message.success('已全部标记为已读')
      fetchSignals()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await signalService.deleteSignal(id)
      message.success('删除成功')
      fetchSignals()
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 统计数据
  const stats = useMemo(() => {
    const buyCount = signals.filter(s => s.direction === 'BUY').length
    const sellCount = signals.filter(s => s.direction === 'SELL').length
    const todayCount = signals.filter(s => dayjs(s.triggeredAt).isSame(dayjs(), 'day')).length
    return { total: signals.length, buyCount, sellCount, todayCount }
  }, [signals])

  // 筛选后的数据
  const filteredSignals = useMemo(() => {
    let result = signals
    if (filterType) result = result.filter(s => s.signalType === filterType)
    if (filterDirection) result = result.filter(s => s.direction === filterDirection)
    return result
  }, [signals, filterType, filterDirection])

  const unreadCount = signals.filter(s => !s.isRead).length

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 8 }} />
            交易信号
          </Title>
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </Space>
        <Space>
          <Switch
            checkedChildren="仅未读"
            unCheckedChildren="全部"
            checked={unreadOnly}
            onChange={setUnreadOnly}
          />
          <Button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            全部已读
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSignal}>
            添加信号
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="信号总数" value={stats.total} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="买入信号" value={stats.buyCount} valueStyle={{ color: '#cf1322' }} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="卖出信号" value={stats.sellCount} valueStyle={{ color: '#3f8600' }} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="今日信号" value={stats.todayCount} valueStyle={{ color: '#1890ff' }} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <FilterOutlined />
            <span>筛选</span>
            <Select
              allowClear
              placeholder="信号类型"
              style={{ width: 120 }}
              value={filterType}
              onChange={setFilterType}
              options={Object.entries(signalTypeLabels).map(([k, v]) => ({ label: v, value: k }))}
            />
            <Select
              allowClear
              placeholder="方向"
              style={{ width: 100 }}
              value={filterDirection}
              onChange={setFilterDirection}
              options={[
                { label: '买入', value: 'BUY' },
                { label: '卖出', value: 'SELL' },
              ]}
            />
          </Space>
        }
      >
        <Spin spinning={loading}>
          {filteredSignals.length > 0 ? (
            <List
              dataSource={filteredSignals}
              renderItem={(signal) => (
                <List.Item
                  style={{
                    background: signal.isRead ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  actions={[
                    !signal.isRead && (
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => handleMarkAsRead(signal.id)}
                      >
                        已读
                      </Button>
                    ),
                    <Popconfirm title="确定删除?" onConfirm={() => handleDelete(signal.id)}>
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: signal.direction === 'BUY' ? '#EF4444' : '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {signal.direction === 'BUY' ? (
                          <ArrowUpOutlined style={{ color: '#fff', fontSize: 18 }} />
                        ) : (
                          <ArrowDownOutlined style={{ color: '#fff', fontSize: 18 }} />
                        )}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{signal.stockName}</Text>
                        <Text type="secondary">({signal.stockCode})</Text>
                        <Tag color={signal.direction === 'BUY' ? 'red' : 'green'}>
                          {signal.direction === 'BUY' ? '买入信号' : '卖出信号'}
                        </Tag>
                        {!signal.isRead && <Badge status="processing" />}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Space>
                          <Tag color="blue">{signalTypeLabels[signal.signalType]}</Tag>
                          <Text type="secondary">{signal.indicator}</Text>
                          <Text>触发价: ¥{signal.price}</Text>
                        </Space>
                        {signal.description && <Text type="secondary">{signal.description}</Text>}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(signal.triggeredAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={<BellOutlined style={{ fontSize: 48, color: '#ccc' }} />}
              description="暂无交易信号"
            />
          )}
        </Spin>
      </Card>

      <Modal
        title="添加交易信号"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="搜索股票" required>
            <StockSearch
              placeholder="输入股票代码或名称搜索"
              onChange={(code, name) => {
                form.setFieldsValue({ stockCode: code, stockName: name })
              }}
            />
          </Form.Item>
          <Form.Item name="stockCode" hidden><input /></Form.Item>
          <Form.Item name="stockName" hidden><input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="signalType" label="信号类型" rules={[{ required: true }]}>
                <Select
                  placeholder="选择类型"
                  options={Object.entries(signalTypeLabels).map(([k, v]) => ({ label: v, value: k }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="direction" label="方向" rules={[{ required: true }]}>
                <Select
                  placeholder="选择方向"
                  options={[
                    { label: '买入', value: 'BUY' },
                    { label: '卖出', value: 'SELL' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="触发价格" rules={[{ required: true }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="indicator" label="指标" rules={[{ required: true }]}>
                <Input placeholder="如: MA5上穿MA20" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="信号描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SignalPage
