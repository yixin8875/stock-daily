import { useState } from 'react'
import { Card, DatePicker, Radio, Button, Space, Typography, message, Alert, Tabs } from 'antd'
import { DownloadOutlined, FileTextOutlined, FileExcelOutlined, TableOutlined, BarChartOutlined, UnorderedListOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { exportService } from '@/services/export'
import type { TradeExportType, ExportFormat } from '@/services/export'

const { RangePicker } = DatePicker
const { Title, Paragraph, Text } = Typography

type DiaryExportFormat = 'json' | 'csv'

const DataExport: React.FC = () => {
  // 日记导出状态
  const [diaryDateRange, setDiaryDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [diaryFormat, setDiaryFormat] = useState<DiaryExportFormat>('json')
  const [diaryLoading, setDiaryLoading] = useState(false)

  // 交易导出状态
  const [tradeDateRange, setTradeDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [tradeExportType, setTradeExportType] = useState<TradeExportType>('detail')
  const [tradeFormat, setTradeFormat] = useState<ExportFormat>('excel')
  const [tradeLoading, setTradeLoading] = useState(false)

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

  // 导出日记
  const handleDiaryExport = async () => {
    setDiaryLoading(true)
    try {
      const startDate = diaryDateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = diaryDateRange?.[1]?.format('YYYY-MM-DD')

      let blob: Blob
      if (diaryFormat === 'json') {
        blob = await exportService.exportJson(startDate, endDate)
      } else {
        blob = await exportService.exportCsv(startDate, endDate)
      }

      const dateStr = dayjs().format('YYYY-MM-DD')
      downloadFile(blob, `stock-diary-export-${dateStr}.${diaryFormat}`)
      message.success('导出成功')
    } catch (error) {
      console.error('Export failed:', error)
      message.error('导出失败，请稍后重试')
    } finally {
      setDiaryLoading(false)
    }
  }

  // 导出交易记录
  const handleTradeExport = async () => {
    setTradeLoading(true)
    try {
      const startDate = tradeDateRange?.[0]?.format('YYYY-MM-DD')
      const endDate = tradeDateRange?.[1]?.format('YYYY-MM-DD')

      const blob = await exportService.exportTrades({
        startDate,
        endDate,
        exportType: tradeExportType,
        format: tradeFormat,
      })

      const dateStr = dayjs().format('YYYY-MM-DD')
      const typeLabel = { detail: '明细', summary: '汇总', analysis: '分析' }[tradeExportType]
      const ext = tradeFormat === 'excel' ? 'xlsx' : tradeFormat
      downloadFile(blob, `交易${typeLabel}-${dateStr}.${ext}`)
      message.success('导出成功')
    } catch (error) {
      console.error('Export failed:', error)
      message.error('导出失败，请稍后重试')
    } finally {
      setTradeLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'diary',
      label: (
        <span>
          <FileTextOutlined />
          日记导出
        </span>
      ),
      children: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                日期范围（可选）
              </Text>
              <RangePicker
                value={diaryDateRange}
                onChange={(dates) => setDiaryDateRange(dates)}
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
              <Radio.Group value={diaryFormat} onChange={(e) => setDiaryFormat(e.target.value)}>
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
              onClick={handleDiaryExport}
              loading={diaryLoading}
              size="large"
            >
              {diaryLoading ? '导出中...' : '导出日记'}
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      key: 'trade',
      label: (
        <span>
          <TableOutlined />
          交易导出
        </span>
      ),
      children: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                日期范围（可选）
              </Text>
              <RangePicker
                value={tradeDateRange}
                onChange={(dates) => setTradeDateRange(dates)}
                style={{ width: '100%', maxWidth: 400 }}
                placeholder={['开始日期', '结束日期']}
                allowClear
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                导出类型
              </Text>
              <Radio.Group
                value={tradeExportType}
                onChange={(e) => setTradeExportType(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="detail">
                  <UnorderedListOutlined /> 交易明细
                </Radio.Button>
                <Radio.Button value="summary">
                  <TableOutlined /> 股票汇总
                </Radio.Button>
                <Radio.Button value="analysis">
                  <BarChartOutlined /> 收益分析
                </Radio.Button>
              </Radio.Group>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {tradeExportType === 'detail' && '导出每笔交易的详细记录'}
                  {tradeExportType === 'summary' && '按股票汇总交易数据'}
                  {tradeExportType === 'analysis' && '导出收益分析报表'}
                </Text>
              </div>
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                文件格式
              </Text>
              <Radio.Group value={tradeFormat} onChange={(e) => setTradeFormat(e.target.value)}>
                <Radio.Button value="excel">
                  <FileExcelOutlined /> Excel
                </Radio.Button>
                <Radio.Button value="csv">
                  <FileTextOutlined /> CSV
                </Radio.Button>
                <Radio.Button value="json">
                  <FileTextOutlined /> JSON
                </Radio.Button>
              </Radio.Group>
            </div>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleTradeExport}
              loading={tradeLoading}
              size="large"
            >
              {tradeLoading ? '导出中...' : '导出交易'}
            </Button>
          </Space>
        </Card>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 800 }}>
      <Title level={2}>数据导出</Title>
      <Paragraph type="secondary">
        导出您的交易日记和交易记录数据，支持多种格式。
      </Paragraph>

      <Tabs items={tabItems} style={{ marginTop: 24 }} />

      <Alert
        style={{ marginTop: 24 }}
        message="导出说明"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>日记导出</strong>：导出完整的日记数据，包含大盘点评、反思、情绪等</li>
            <li><strong>交易明细</strong>：导出每笔交易的详细信息（股票、价格、数量、时间）</li>
            <li><strong>股票汇总</strong>：按股票代码汇总交易数据和盈亏情况</li>
            <li><strong>收益分析</strong>：导出收益曲线、胜率等分析数据</li>
            <li>Excel 格式适合在表格软件中查看，JSON 格式适合程序处理</li>
          </ul>
        }
        type="info"
        showIcon
      />
    </div>
  )
}

export default DataExport
