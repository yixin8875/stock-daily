import React, { useState, useEffect, useCallback } from 'react'
import { Typography, DatePicker, Button, Space, Row, Col, Spin, Empty, message, Card, Statistic } from 'antd'
import { ReloadOutlined, SyncOutlined, CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import type { DailyReview, DeviationTrend } from '@/types/review'
import { ExecutionMetricsCard, PlanComparisonCard, DeviationChart, ReviewTemplateManager } from './components'
import { useThemeStore } from '@/stores'
import { reviewService } from '@/services/review'

const { Title, Text } = Typography

const ReviewPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [loading, setLoading] = useState(false)
  const [review, setReview] = useState<DailyReview | null>(null)
  const [trend, setTrend] = useState<DeviationTrend[]>([])
  const { mode } = useThemeStore()

  const fetchReview = useCallback(async () => {
    setLoading(true)
    try {
      const [reviewRes, trendRes] = await Promise.all([
        reviewService.getDailyReview(selectedDate.format('YYYY-MM-DD')),
        reviewService.getDeviationTrend(undefined, undefined, 30),
      ])
      setReview(reviewRes.data)
      setTrend(trendRes.data)
    } catch (error) {
      console.error('Failed to fetch review:', error)
      message.error('获取复盘数据失败')
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  const handlePrevDay = () => {
    let newDate = selectedDate.subtract(1, 'day')
    while (newDate.day() === 0 || newDate.day() === 6) {
      newDate = newDate.subtract(1, 'day')
    }
    setSelectedDate(newDate)
  }

  const handleNextDay = () => {
    let newDate = selectedDate.add(1, 'day')
    while (newDate.day() === 0 || newDate.day() === 6) {
      newDate = newDate.add(1, 'day')
    }
    if (newDate.isAfter(dayjs())) {
      message.info('不能选择未来日期')
      return
    }
    setSelectedDate(newDate)
  }

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
              background: `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <SyncOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              交易复盘
            </Title>
            <Text type="secondary">对比计划与实际执行情况</Text>
          </div>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchReview} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 日期选择器 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 24,
          padding: 16,
          borderRadius: 12,
          background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
          border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
        }}
      >
        <Button icon={<LeftOutlined />} onClick={handlePrevDay} />
        <Space>
          <CalendarOutlined />
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            allowClear={false}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Space>
        <Button icon={<RightOutlined />} onClick={handleNextDay} disabled={selectedDate.isSame(dayjs(), 'day')} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">正在加载复盘数据...</Text>
          </div>
        </div>
      ) : review ? (
        <Row gutter={[24, 24]}>
          {/* 概览统计 */}
          <Col span={24}>
            <Card>
              <Row gutter={[24, 24]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="计划交易"
                    value={review.metrics.planCount}
                    suffix="笔"
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="已执行"
                    value={review.metrics.executedCount}
                    suffix="笔"
                    valueStyle={{ color: '#10B981' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="执行率"
                    value={review.metrics.executionRate.toFixed(1)}
                    suffix="%"
                    valueStyle={{ color: review.metrics.executionRate >= 70 ? '#10B981' : '#F59E0B' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="未执行"
                    value={review.metrics.missedCount}
                    suffix="笔"
                    valueStyle={{ color: review.metrics.missedCount > 0 ? '#F59E0B' : undefined }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 执行指标 */}
          <Col span={24}>
            <ExecutionMetricsCard metrics={review.metrics} />
          </Col>

          {/* 计划对比 */}
          <Col span={24}>
            <PlanComparisonCard pairs={review.pairs} />
          </Col>

          {/* 趋势图 */}
          <Col span={24}>
            <DeviationChart data={trend} />
          </Col>

          {/* 复盘模板 */}
          <Col span={24}>
            <ReviewTemplateManager />
          </Col>
        </Row>
      ) : (
        <Empty description="暂无复盘数据" style={{ padding: '100px 0' }} />
      )}
    </div>
  )
}

export default ReviewPage
