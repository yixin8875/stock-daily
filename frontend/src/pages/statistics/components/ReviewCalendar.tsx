import React, { useState, useEffect } from 'react'
import { Card, Calendar, Modal, Table, Tag, Typography, Space, Statistic, Row, Col } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { statisticsService } from '@/services'
import type { ReviewCalendarDay, ReviewCalendarTrade } from '@/types/statistics'

const { Text } = Typography

const ReviewCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const [calendarData, setCalendarData] = useState<ReviewCalendarDay[]>([])
  const [summary, setSummary] = useState<{ totalProfit: number; tradingDays: number; winDays: number; lossDays: number } | null>(null)
  const [selectedDay, setSelectedDay] = useState<ReviewCalendarDay | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    fetchCalendarData()
  }, [currentMonth])

  const fetchCalendarData = async () => {
    try {
      const res = await statisticsService.getReviewCalendar(currentMonth)
      setCalendarData(res.data.data?.data || [])
      setSummary(res.data.data?.summary || null)
    } catch {
      setCalendarData([])
    }
  }

  const getDateData = (date: Dayjs): ReviewCalendarDay | undefined => {
    return calendarData.find(d => d.date === date.format('YYYY-MM-DD'))
  }

  const dateCellRender = (date: Dayjs) => {
    const data = getDateData(date)
    if (!data || data.tradeCount === 0) return null

    const isProfit = data.profit > 0
    return (
      <div
        style={{
          background: isProfit ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
          borderRadius: 4,
          padding: '2px 4px',
          cursor: 'pointer',
        }}
        onClick={() => { setSelectedDay(data); setModalVisible(true) }}
      >
        <Text style={{ color: isProfit ? '#52C41A' : '#FF4D4F', fontSize: 12 }}>
          {isProfit ? '+' : ''}{data.profit.toFixed(0)}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 10 }}>{data.tradeCount}笔</Text>
      </div>
    )
  }

  const onPanelChange = (date: Dayjs) => {
    setCurrentMonth(date.format('YYYY-MM'))
  }

  const tradeColumns = [
    { title: '股票', dataIndex: 'stockName', key: 'stockName' },
    { title: '代码', dataIndex: 'stockCode', key: 'stockCode' },
    {
      title: '类型', dataIndex: 'type', key: 'type',
      render: (v: string) => <Tag color={v === 'BUY' ? 'green' : 'red'}>{v === 'BUY' ? '买入' : '卖出'}</Tag>
    },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '盈亏', key: 'profit',
      render: (_: unknown, r: ReviewCalendarTrade) => r.profit !== undefined ? (
        <Text style={{ color: r.profit >= 0 ? '#52C41A' : '#FF4D4F' }}>
          {r.profit >= 0 ? '+' : ''}{r.profit.toFixed(2)}
        </Text>
      ) : '-'
    },
  ]

  return (
    <Card title={<><CalendarOutlined style={{ marginRight: 8 }} />交易复盘日历</>}>
      {summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}><Statistic title="本月盈亏" value={summary.totalProfit} precision={2} prefix="¥" valueStyle={{ color: summary.totalProfit >= 0 ? '#52C41A' : '#FF4D4F' }} /></Col>
          <Col span={6}><Statistic title="交易天数" value={summary.tradingDays} suffix="天" /></Col>
          <Col span={6}><Statistic title="盈利天数" value={summary.winDays} suffix="天" valueStyle={{ color: '#52C41A' }} /></Col>
          <Col span={6}><Statistic title="亏损天数" value={summary.lossDays} suffix="天" valueStyle={{ color: '#FF4D4F' }} /></Col>
        </Row>
      )}
      <Calendar cellRender={dateCellRender} onPanelChange={onPanelChange} />

      <Modal
        title={selectedDay ? `${selectedDay.date} 交易详情` : '交易详情'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedDay && (
          <>
            <Space style={{ marginBottom: 16 }}>
              <Statistic title="当日盈亏" value={selectedDay.profit} precision={2} prefix="¥" valueStyle={{ color: selectedDay.profit >= 0 ? '#52C41A' : '#FF4D4F' }} />
              <Statistic title="收益率" value={selectedDay.profitRate} precision={2} suffix="%" valueStyle={{ color: selectedDay.profitRate >= 0 ? '#52C41A' : '#FF4D4F' }} />
              <Statistic title="交易笔数" value={selectedDay.tradeCount} />
            </Space>
            <Table columns={tradeColumns} dataSource={selectedDay.trades} rowKey="id" pagination={false} size="small" />
          </>
        )}
      </Modal>
    </Card>
  )
}

export default ReviewCalendar
