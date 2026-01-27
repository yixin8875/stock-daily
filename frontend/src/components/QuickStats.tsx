import React, { useEffect, useState } from 'react'
import { Row, Col, Statistic, Spin } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { dashboardService } from '@/services'

interface Stats {
  totalProfit: number
  winRate: number
  totalTrades: number
  todayTrades: number
}

const QuickStats: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const data = await dashboardService.getDashboardData()
        setStats({
          totalProfit: data.periodStats.monthProfit || 0,
          winRate: data.periodStats.monthWinRate || 0,
          totalTrades: data.periodStats.monthTradeDays || 0,
          todayTrades: data.todayOverview.tradeCount || 0,
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <Spin />

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Statistic
          title="总收益"
          value={stats?.totalProfit || 0}
          precision={2}
          prefix={stats?.totalProfit && stats.totalProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          valueStyle={{ color: stats?.totalProfit && stats.totalProfit >= 0 ? '#10B981' : '#EF4444' }}
        />
      </Col>
      <Col span={6}>
        <Statistic
          title="胜率"
          value={stats?.winRate || 0}
          precision={1}
          suffix="%"
          valueStyle={{ color: stats?.winRate && stats.winRate >= 50 ? '#10B981' : '#EF4444' }}
        />
      </Col>
      <Col span={6}>
        <Statistic title="总交易次数" value={stats?.totalTrades || 0} />
      </Col>
      <Col span={6}>
        <Statistic title="今日交易" value={stats?.todayTrades || 0} />
      </Col>
    </Row>
  )
}

export default QuickStats
