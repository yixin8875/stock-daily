import React, { useEffect } from 'react'
import { Typography, DatePicker, Button, Spin, Alert } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useDiaryStore } from '@/stores/diaryStore'
import {
  WatchStockCard,
  BuyPlanCard,
  SellPlanCard,
  StopLossCard,
  RiskAlertCard,
} from './components'

const { Title, Text } = Typography

const TomorrowPlan: React.FC = () => {
  const {
    selectedDate,
    planLoading,
    planSaving,
    setSelectedDate,
    fetchPlan,
    savePlan,
  } = useDiaryStore()

  useEffect(() => {
    fetchPlan(selectedDate)
  }, [selectedDate, fetchPlan])

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'))
    }
  }

  const handleSave = async () => {
    await savePlan()
  }

  return (
    <div style={{ padding: '0 0 80px 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <Title level={3} style={{ margin: 0 }}>明日计划</Title>
        <DatePicker
          value={dayjs(selectedDate)}
          onChange={handleDateChange}
          allowClear={false}
          format="YYYY-MM-DD"
        />
      </div>

      <Alert
        message={
          <Text>
            当前计划关联日期: <Text strong>{selectedDate}</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              (明日计划是今日总结的一部分，关联同一个日记记录)
            </Text>
          </Text>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Spin spinning={planLoading}>
        <WatchStockCard />
        <BuyPlanCard />
        <SellPlanCard />
        <StopLossCard />
        <RiskAlertCard />
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
          loading={planSaving}
          onClick={handleSave}
          style={{ minWidth: 200 }}
        >
          保存明日计划
        </Button>
      </div>
    </div>
  )
}

export default TomorrowPlan