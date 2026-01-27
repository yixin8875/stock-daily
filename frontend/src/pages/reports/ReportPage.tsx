import React, { useState, useEffect, useCallback } from 'react'
import { Typography, Tabs, DatePicker, Button, Space, Row, Col, Spin, Empty, message } from 'antd'
import { DownloadOutlined, ReloadOutlined, FileTextOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { PeriodReport, ReportPeriod } from '@/types/report'
import {
  ReportSummaryCard,
  StockRankingTable,
  EmotionChart,
  LearningHighlights,
  DailyProfitChart,
} from './components'
import { useThemeStore } from '@/stores'
import { reportService } from '@/services/report'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const { Title, Text } = Typography

const ReportPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportPeriod>('week')
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [report, setReport] = useState<PeriodReport | null>(null)
  const { mode } = useThemeStore()

  const fetchReport = useCallback(async () => {
    setLoading(true)
    try {
      const response = await reportService.getReport(reportType, selectedDate.format('YYYY-MM-DD'))
      setReport(response.data)
    } catch (error) {
      console.error('Failed to fetch report:', error)
      message.error('获取报告失败')
    } finally {
      setLoading(false)
    }
  }, [reportType, selectedDate])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const handleExport = async () => {
    if (!report) {
      message.warning('暂无报告数据可导出')
      return
    }

    setExporting(true)
    try {
      const response = await reportService.exportReport(reportType, selectedDate.format('YYYY-MM-DD'))

      // 创建下载链接
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const periodLabel = reportType === 'week' ? '周报' : '月报'
      const dateLabel = selectedDate.format('YYYY-MM-DD')
      link.download = `交易${periodLabel}_${dateLabel}.xlsx`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success('报告导出成功')
    } catch (error) {
      console.error('Failed to export report:', error)
      message.error('导出报告失败')
    } finally {
      setExporting(false)
    }
  }

  const tabItems = [
    { key: 'week', label: '周报' },
    { key: 'month', label: '月报' },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <FileTextOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              交易报告
            </Title>
            <Text type="secondary">自动汇总周度、月度交易数据</Text>
          </div>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchReport} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>
            导出报告
          </Button>
        </Space>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          padding: 16,
          borderRadius: 12,
          background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
        }}
      >
        <Tabs
          activeKey={reportType}
          onChange={(key) => setReportType(key as ReportPeriod)}
          items={tabItems}
          style={{ marginBottom: 0 }}
        />
        <div style={{ marginLeft: 'auto' }}>
          {reportType === 'week' ? (
            <DatePicker
              picker="week"
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              allowClear={false}
              format="YYYY-wo"
            />
          ) : (
            <DatePicker
              picker="month"
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              allowClear={false}
              format="YYYY年M月"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">正在生成报告...</Text>
          </div>
        </div>
      ) : report ? (
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <ReportSummaryCard
              profitSummary={report.profitSummary}
              periodLabel={`${report.startDate} ~ ${report.endDate}`}
            />
          </Col>
          <Col span={24}>
            <DailyProfitChart
              dailyProfits={report.dailyProfits}
              periodLabel={`${report.startDate} ~ ${report.endDate}`}
            />
          </Col>
          <Col xs={24} lg={12}>
            <StockRankingTable stockPerformance={report.stockPerformance} />
          </Col>
          <Col xs={24} lg={12}>
            <Row gutter={[0, 24]}>
              <Col span={24}>
                <EmotionChart emotionStats={report.emotionStats} />
              </Col>
              <Col span={24}>
                <LearningHighlights
                  learnings={report.learnings}
                  reflections={report.reflections}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <Empty description="暂无报告数据" style={{ padding: '100px 0' }} />
      )}
    </div>
  )
}

export default ReportPage
