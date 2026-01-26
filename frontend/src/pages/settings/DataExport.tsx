import { useState } from 'react'
import { Card, DatePicker, Radio, Button, Space, Typography, message, Alert } from 'antd'
import { DownloadOutlined, FileTextOutlined, FileExcelOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { exportService } from '@/services/export'

const { RangePicker } = DatePicker
const { Title, Paragraph, Text } = Typography

type ExportFormat = 'json' | 'csv'

const DataExport: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [format, setFormat] = useState<ExportFormat>('json')
  const [loading, setLoading] = useState(false)

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const generateFilename = (format: ExportFormat): string => {
    const dateStr = dayjs().format('YYYY-MM-DD')
    return `stock-diary-export-${dateStr}.${format}`
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const startDate = dateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = dateRange?.[1]?.format('YYYY-MM-DD')

      let blob: Blob
      if (format === 'json') {
        blob = await exportService.exportJson(startDate, endDate)
      } else {
        blob = await exportService.exportCsv(startDate, endDate)
      }

      const filename = generateFilename(format)
      downloadFile(blob, filename)
      message.success('导出成功')
    } catch (error) {
      console.error('Export failed:', error)
      message.error('导出失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Title level={2}>数据导出</Title>
      <Paragraph type="secondary">
        导出您的交易日记数据，支持 JSON 和 CSV 两种格式。
      </Paragraph>

      <Card title="导出设置" style={{ marginTop: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              日期范围（可选）
            </Text>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              style={{ width: '100%', maxWidth: 400 }}
              placeholder={['开始日期', '结束日期']}
              allowClear
            />
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">不选择日期将导出全部数据</Text>
            </div>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              导出格式
            </Text>
            <Radio.Group value={format} onChange={(e) => setFormat(e.target.value)}>
              <Radio.Button value="json">
                <FileTextOutlined /> JSON
              </Radio.Button>
              <Radio.Button value="csv">
                <FileExcelOutlined /> CSV
              </Radio.Button>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={loading}
            size="large"
          >
            {loading ? '导出中...' : '开始导出'}
          </Button>
        </Space>
      </Card>

      <Alert
        style={{ marginTop: 24 }}
        message="导出说明"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>JSON 格式：适合数据备份和程序处理，包含完整的结构化数据</li>
            <li>CSV 格式：适合在 Excel 等表格软件中查看和分析</li>
            <li>导出的文件将自动下载到您的设备</li>
            <li>文件名格式：stock-diary-export-日期.格式</li>
          </ul>
        }
        type="info"
        showIcon
      />
    </div>
  )
}

export default DataExport
