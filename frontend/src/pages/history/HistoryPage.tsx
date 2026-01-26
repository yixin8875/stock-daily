import React, { useEffect } from 'react'
import { Typography, Segmented, Card, Spin } from 'antd'
import { CalendarOutlined, UnorderedListOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useHistoryStore } from '@/stores'
import { CalendarView, ListView, DiaryDetailModal } from './components'
import type { TodaySummary } from '@/types/diary'
import type { Dayjs } from 'dayjs'

const { Title } = Typography

const HistoryPage: React.FC = () => {
  const {
    viewType,
    setViewType,
    calendarData,
    calendarLoading,
    currentMonth,
    setCurrentMonth,
    listData,
    listLoading,
    listTotal,
    listPage,
    listPageSize,
    dateRange,
    setDateRange,
    setListPage,
    setListPageSize,
    fetchCalendarData,
    fetchListData,
    detailModalOpen,
    detailLoading,
    detailSummary,
    detailPlan,
    openDetailModal,
    closeDetailModal,
  } = useHistoryStore()

  useEffect(() => {
    if (viewType === 'calendar') {
      const date = dayjs(currentMonth)
      fetchCalendarData(date.year(), date.month() + 1)
    } else {
      fetchListData()
    }
  }, [viewType])

  const handleMonthChange = (date: Dayjs) => {
    const monthStr = date.format('YYYY-MM')
    setCurrentMonth(monthStr)
    fetchCalendarData(date.year(), date.month() + 1)
  }

  const handleDateClick = (date: string) => {
    openDetailModal(date)
  }

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setDateRange([
        dates[0] ? dates[0].format('YYYY-MM-DD') : null,
        dates[1] ? dates[1].format('YYYY-MM-DD') : null,
      ])
    } else {
      setDateRange([null, null])
    }
  }

  const handlePaginationChange = (page: number, pageSize: number) => {
    if (pageSize !== listPageSize) {
      setListPageSize(pageSize)
    } else {
      setListPage(page)
    }
  }

  const handleRowClick = (record: TodaySummary) => {
    openDetailModal(record.date)
  }

  const viewOptions = [
    { label: '日历视图', value: 'calendar', icon: <CalendarOutlined /> },
    { label: '列表视图', value: 'list', icon: <UnorderedListOutlined /> },
  ]

  return (
    <div style={{ padding: '0 0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>历史回顾</Title>
        <Segmented
          options={viewOptions}
          value={viewType}
          onChange={(value) => setViewType(value as 'calendar' | 'list')}
        />
      </div>

      <Card>
        {viewType === 'calendar' ? (
          <Spin spinning={calendarLoading}>
            <CalendarView
              calendarData={calendarData}
              currentMonth={dayjs(currentMonth)}
              onMonthChange={handleMonthChange}
              onDateClick={handleDateClick}
            />
          </Spin>
        ) : (
          <ListView
            data={listData}
            loading={listLoading}
            pagination={{
              current: listPage,
              pageSize: listPageSize,
              total: listTotal,
            }}
            onPaginationChange={handlePaginationChange}
            onDateRangeChange={handleDateRangeChange}
            onRowClick={handleRowClick}
            dateRange={dateRange[0] && dateRange[1] ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
          />
        )}
      </Card>

      <DiaryDetailModal
        open={detailModalOpen}
        onClose={closeDetailModal}
        summary={detailSummary}
        plan={detailPlan}
        loading={detailLoading}
      />
    </div>
  )
}

export default HistoryPage
