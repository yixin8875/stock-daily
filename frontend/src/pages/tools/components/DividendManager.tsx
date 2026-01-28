import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, InputNumber, DatePicker, Empty, Statistic, Row, Col, message, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { dividendService, type DividendRecord } from '@/services'

const DividendManager: React.FC = () => {
  const [data, setData] = useState<DividendRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await dividendService.getAll()
      setData(res.data.data || [])
    } catch {
      message.error('获取分红记录失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = async () => {
    try {
      const values = await form.validateFields()
      await dividendService.create({
        stockCode: values.stockCode,
        stockName: values.stockName,
        exDate: values.exDate.format('YYYY-MM-DD'),
        dividendType: 'cash',
        amount: values.dividendPerShare,
        shares: values.shares,
        totalAmount: values.dividendPerShare * values.shares,
      })
      message.success('添加成功')
      setModalVisible(false)
      form.resetFields()
      fetchData()
    } catch {
      message.error('添加失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dividendService.delete(id)
      message.success('删除成功')
      fetchData()
    } catch {
      message.error('删除失败')
    }
  }

  const totalDividend = data.reduce((sum, d) => sum + Number(d.totalAmount || 0), 0)
  const yearDividend = data
    .filter((d) => dayjs(d.exDate).year() === dayjs().year())
    .reduce((sum, d) => sum + Number(d.totalAmount || 0), 0)

  const columns = [
    { title: '股票代码', dataIndex: 'stockCode', key: 'stockCode', width: 100 },
    { title: '股票名称', dataIndex: 'stockName', key: 'stockName', width: 100 },
    { title: '除权日', dataIndex: 'exDate', key: 'exDate', width: 110,
      render: (v: string) => v?.slice(0, 10) },
    {
      title: '每股分红',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `¥${Number(v).toFixed(4)}`,
    },
    { title: '持股数', dataIndex: 'shares', key: 'shares' },
    {
      title: '分红金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => <span style={{ color: '#cf1322' }}>¥{Number(v).toFixed(2)}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: DividendRecord) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
      ),
    },
  ]

  return (
    <Card
      title="分红记录管理"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>添加记录</Button>}
    >
      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic title="累计分红" value={totalDividend.toFixed(2)} prefix="¥" valueStyle={{ color: '#cf1322' }} />
        </Col>
        <Col span={12}>
          <Statistic title="本年分红" value={yearDividend.toFixed(2)} prefix="¥" valueStyle={{ color: '#1890ff' }} />
        </Col>
      </Row>

      {data.length === 0 ? (
        <Empty description="暂无分红记录" />
      ) : (
        <Table columns={columns} dataSource={data} rowKey="id" size="small" pagination={{ pageSize: 10 }} />
      )}
      </Spin>

      <Modal title="添加分红记录" open={modalVisible} onOk={handleAdd} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}>
            <Input placeholder="如: 600519" />
          </Form.Item>
          <Form.Item name="stockName" label="股票名称" rules={[{ required: true }]}>
            <Input placeholder="如: 贵州茅台" />
          </Form.Item>
          <Form.Item name="exDate" label="除权日" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dividendPerShare" label="每股分红(元)" rules={[{ required: true }]}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="shares" label="持股数量" rules={[{ required: true }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default DividendManager
