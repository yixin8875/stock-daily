import React, { useState, useEffect } from 'react'
import { Card, Form, InputNumber, Select, Button, Table, Space, Row, Col, Spin, Empty } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { stockService, type StockScreenerParams, type ScreenerResult } from '@/services'

const STORAGE_KEY = 'stock_screener_filters'

const StockScreener: React.FC = () => {
  const [form] = Form.useForm()
  const [data, setData] = useState<ScreenerResult[]>([])
  const [loading, setLoading] = useState(false)

  // 从 localStorage 加载筛选条件
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const filters = JSON.parse(saved)
        form.setFieldsValue(filters)
      } catch (e) {
        console.error('Failed to load screener filters:', e)
      }
    }
  }, [form])

  const sectorOptions = [
    { label: '科技', value: 'tech' },
    { label: '金融', value: 'finance' },
    { label: '医药', value: 'medical' },
    { label: '消费', value: 'consumer' },
    { label: '新能源', value: 'energy' },
    { label: '制造', value: 'manufacture' },
  ]

  const handleSearch = async () => {
    const values = form.getFieldsValue()

    // 保存筛选条件到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values))

    const params: StockScreenerParams = {}
    if (values.priceRange?.[0]) params.minPrice = values.priceRange[0]
    if (values.priceRange?.[1]) params.maxPrice = values.priceRange[1]
    if (values.peRange?.[0]) params.minPE = values.peRange[0]
    if (values.peRange?.[1]) params.maxPE = values.peRange[1]
    if (values.pbRange?.[0]) params.minPB = values.pbRange[0]
    if (values.pbRange?.[1]) params.maxPB = values.pbRange[1]
    if (values.changeRange?.[0]) params.minChangePercent = values.changeRange[0]
    if (values.changeRange?.[1]) params.maxChangePercent = values.changeRange[1]
    if (values.sectors?.length) params.sectors = values.sectors

    setLoading(true)
    try {
      const res = await stockService.screenStocks(params)
      setData(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    form.resetFields()
    setData([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const columns = [
    { title: '代码', dataIndex: 'code', key: 'code', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 80 },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      sorter: (a: ScreenerResult, b: ScreenerResult) => a.price - b.price,
      render: (v: number) => v.toFixed(2),
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      sorter: (a: ScreenerResult, b: ScreenerResult) => a.changePercent - b.changePercent,
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#cf1322' : '#3f8600' }}>{v.toFixed(2)}%</span>
      ),
    },
    {
      title: 'PE',
      dataIndex: 'pe',
      key: 'pe',
      sorter: (a: ScreenerResult, b: ScreenerResult) => a.pe - b.pe,
      render: (v: number) => v.toFixed(2),
    },
    {
      title: 'PB',
      dataIndex: 'pb',
      key: 'pb',
      sorter: (a: ScreenerResult, b: ScreenerResult) => a.pb - b.pb,
      render: (v: number) => v.toFixed(2),
    },
    { title: '板块', dataIndex: 'sector', key: 'sector' },
  ]

  return (
    <Card title="股票筛选器">
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="价格区间" name="priceRange">
              <Space>
                <InputNumber placeholder="最低" style={{ width: 80 }} />
                <span>-</span>
                <InputNumber placeholder="最高" style={{ width: 80 }} />
              </Space>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="PE区间" name="peRange">
              <Space>
                <InputNumber placeholder="最低" style={{ width: 80 }} />
                <span>-</span>
                <InputNumber placeholder="最高" style={{ width: 80 }} />
              </Space>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="PB区间" name="pbRange">
              <Space>
                <InputNumber placeholder="最低" style={{ width: 80 }} />
                <span>-</span>
                <InputNumber placeholder="最高" style={{ width: 80 }} />
              </Space>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="涨跌幅(%)" name="changeRange">
              <Space>
                <InputNumber placeholder="最低" style={{ width: 80 }} />
                <span>-</span>
                <InputNumber placeholder="最高" style={{ width: 80 }} />
              </Space>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="板块" name="sectors">
              <Select mode="multiple" placeholder="选择板块" options={sectorOptions} allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label=" ">
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  筛选
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Empty description="请设置筛选条件" />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="code"
            size="small"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Spin>
    </Card>
  )
}

export default StockScreener
