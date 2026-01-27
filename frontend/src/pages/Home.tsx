import React, { useEffect } from 'react'
import { Row, Col, Typography, Space } from 'antd'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useResponsive } from '@/hooks'
import {
  TodayOverviewCard,
  PeriodStatsCard,
  QuickActionsCard,
  RecentDiariesCard,
  TomorrowPlanCard,
} from './home/components'
import { TodayReminders } from '@/components'

const { Title } = Typography

const Home: React.FC = () => {
  const {
    loading,
    todayOverview,
    periodStats,
    recentDiaries,
    tomorrowPlan,
    fetchDashboardData,
  } = useDashboardStore()
  const { isMobile } = useResponsive()

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return (
    <div style={{ padding: 0 }}>
      <Space direction="vertical" size={isMobile ? 'middle' : 'large'} style={{ width: '100%' }}>
        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          Stock Daily - 交易日记
        </Title>

        {/* 今日概览 */}
        <TodayOverviewCard data={todayOverview} loading={loading} />

        {/* 快捷入口 */}
        <QuickActionsCard />

        {/* 今日提醒 */}
        <TodayReminders />

        {/* 本周/本月统计 */}
        <PeriodStatsCard data={periodStats} loading={loading} />

        <Row gutter={[16, 16]}>
          {/* 最近日记 */}
          <Col xs={24} lg={12}>
            <RecentDiariesCard data={recentDiaries} loading={loading} />
          </Col>

          {/* 明日计划 */}
          <Col xs={24} lg={12}>
            <TomorrowPlanCard data={tomorrowPlan} loading={loading} />
          </Col>
        </Row>
      </Space>
    </div>
  )
}

export default Home
