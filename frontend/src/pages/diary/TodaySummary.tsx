import React, { useEffect } from 'react'
import { Typography, DatePicker, Button, Spin } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useDiaryStore } from '@/stores/diaryStore'
import {
  MarketCommentCard,
  TradeRecordCard,
  ProfitLossCard,
  ReflectionCard,
  EmotionCard,
  LearningNoteCard,
} from './components'

const { Title } = Typography

const TodaySummary: React.FC = () => {
  const {
    selectedDate,
    loading,
    saving,
    setSelectedDate,
    fetchSummary,
    saveSummary,
  } = useDiaryStore()

  useEffect(() => {
    fetchSummary(selectedDate)
  }, [selectedDate, fetchSummary])

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'))
    }
  }

  const handleSave = async () => {
    await saveSummary()
  }

  return (
    <div style={{ padding: '0 0 80px 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={3} style={{ margin: 0 }}>今日总结</Title>
        <DatePicker
          value={dayjs(selectedDate)}
          onChange={handleDateChange}
          allowClear={false}
          format="YYYY-MM-DD"
        />
      </div>

      <Spin spinning={loading}>
        <MarketCommentCard />
        <TradeRecordCard />
        <ProfitLossCard />
        <ReflectionCard />
        <EmotionCard />
        <LearningNoteCard />
      </Spin>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        background: '#fff',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100,
      }}>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          style={{ minWidth: 200 }}
        >
          保存今日总结
        </Button>
      </div>
    </div>
  )
}

export default TodaySummary
