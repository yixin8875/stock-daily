import React from 'react'
import { Calendar, Badge, Typography } from 'antd'
import type { Dayjs } from 'dayjs'
import type { CalendarDayData } from '@/types/diary'

const { Text } = Typography

interface CalendarViewProps {
  calendarData: Record<string, CalendarDayData>
  currentMonth: Dayjs
  onMonthChange: (date: Dayjs) => void
  onDateClick: (date: string) => void
}

const CalendarView: React.FC<CalendarViewProps> = ({
  calendarData,
  currentMonth,
  onMonthChange,
  onDateClick,
}) => {
  const dateCellRender = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    const data = calendarData[dateStr]

    if (!data) return null

    const profit = data.todayProfit
    const isProfit = profit !== null && profit >= 0

    return (
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        {profit !== null && (
          <Text
            style={{
              fontSize: 12,
              color: isProfit ? '#F5222D' : '#52C41A',
              fontWeight: 500,
            }}
          >
            {isProfit ? '+' : ''}{profit.toFixed(0)}
          </Text>
        )}
        {data.hasRecord && profit === null && (
          <Badge status="processing" />
        )}
      </div>
    )
  }

  const cellRender = (date: Dayjs, info: { type: string }) => {
    if (info.type === 'date') {
      const dateStr = date.format('YYYY-MM-DD')
      const data = calendarData[dateStr]
      const profit = data?.todayProfit

      let bgColor = 'transparent'
      if (profit !== null && profit !== undefined) {
        bgColor = profit >= 0 ? 'rgba(245, 34, 45, 0.1)' : 'rgba(82, 196, 26, 0.1)'
      }

      return (
        <div
          style={{
            position: 'relative',
            height: '100%',
            minHeight: 60,
            backgroundColor: bgColor,
            borderRadius: 4,
            cursor: data?.hasRecord ? 'pointer' : 'default',
          }}
          onClick={() => data?.hasRecord && onDateClick(dateStr)}
        >
          {dateCellRender(date)}
        </div>
      )
    }
    return null
  }

  return (
    <Calendar
      value={currentMonth}
      onPanelChange={onMonthChange}
      cellRender={cellRender}
      style={{ padding: 16 }}
    />
  )
}

export default CalendarView
