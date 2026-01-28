import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, InputNumber, DatePicker, Empty, Statistic, Row, Col } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface DividendRecord {
  id: string
  stockCode: string
  stockName: string
  exDate: string
  payDate: string
  dividendPerShare: number
  shares: number
  totalAmount: number
}

const DividendManager: React.FC = () => {
  const [data, setData] = useState<DividendRecord[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const saved = localStorage.getItem('dividendRecords')
    if (saved) setData(JSON.parse(saved))
  }, [])

  const saveData = (newData: DividendRecord[]) => {
    setData(newData)
    localStorage.setItem('dividendRecords', JSON.stringify(newData))
  }

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newRecord: DividendRecord = {
        id: Date.now().toString(),
        stockCode: values.stockCode,
        stockName: values.stockName,
        exDate: values.exDate.format('YYYY-MM-DD'),
        payDate: values.payDate.format('YYYY-MM-DD'),
        dividendPerShare: values.dividendPerShare,
        shares: values.shares,
        totalAmount: values.dividendPerShare * values.shares,
      }
      saveData([...data, newRecord])
      setModalVisible(false)
      form.resetFields()
    })
  }

  const handleDelete = (id: string) => {
    saveData(data.filter((d) => d.id !== id))
  }

  const totalDividend = data.reduce((sum, d) => sum + d.totalAmount, 0)
  const yearDividend = data
    .filter((d) => dayjs(d.payDate).year() === dayjs().year())
    .reduce((sum, d) => sum + d.totalAmount, 0)

  const columns = [
    { title: '股票代码', dataIndex: 'stockCode', key: 'stockCode', width: 100 },
    { title: '股票名称', dataIndex: 'stockName', key: 'stockName', width: 100 },
    { title: '除权日', dataIndex: 'exDate', key: 'exDate', width: 110 },
    { title: '派息日', dataIndex: 'payDate', key: 'payDate', width: 110 },
    {
      title: '每股分红',
      dataIndex: 'dividendPerShare',
      key: 'dividendPerShare',
      render: (v: number) => `¥${v.toFixed(4)}`,
    },
    { title: '持股数', dataIndex: 'shares', key: 'shares' },
    {
      title: '分红金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => <span style={{ color: '#cf1322' }}>¥{v.toFixed(2)}</span>,
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
          <Form.Item name="payDate" label="派息日" rules={[{ required: true }]}>
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
