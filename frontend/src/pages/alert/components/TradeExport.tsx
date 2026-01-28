import React, { useState } from 'react'
import { Card, Form, DatePicker, Select, Button, Space, message } from 'antd'
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const TradeExport: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleExport = async (format: 'excel' | 'pdf') => {
    const values = form.getFieldsValue()
    setLoading(true)

    try {
      const params = new URLSearchParams({
        format,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD') || '',
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD') || '',
        type: values.type || 'all',
      })

      const response = await fetch(`/api/export/trades?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })

      if (!response.ok) throw new Error('导出失败')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `交易日志_${dayjs().format('YYYYMMDD')}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      a.click()
      window.URL.revokeObjectURL(url)
      message.success('导出成功')
    } catch {
      message.error('导出失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title={<><DownloadOutlined style={{ marginRight: 8 }} />交易日志导出</>}>
      <Form form={form} layout="inline">
        <Form.Item name="dateRange" label="日期范围">
          <RangePicker />
        </Form.Item>
        <Form.Item name="type" label="导出类型" initialValue="all">
          <Select style={{ width: 120 }}>
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="trades">交易记录</Select.Option>
            <Select.Option value="diary">交易日记</Select.Option>
            <Select.Option value="statistics">统计报告</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => handleExport('excel')}
              loading={loading}
            >
              导出Excel
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => handleExport('pdf')}
              loading={loading}
            >
              导出PDF
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default TradeExport
