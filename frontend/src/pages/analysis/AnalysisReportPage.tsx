import React, { useEffect, useState } from 'react'
import { Card, Radio, DatePicker, Space, Typography, Statistic, Row, Col, Spin, Empty, Table, Tag } from 'antd'
import ReactECharts from 'echarts-for-react'
import dayjs, { Dayjs } from 'dayjs'
import { analysisService, type PeriodReport, type TradeReview } from '@/services'

const { Title, Text } = Typography

const AnalysisReportPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<PeriodReport | null>(null)
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week')
  const [date, setDate] = useState<Dayjs>(dayjs())

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await analysisService.generateReport(periodType, date.format('YYYY-MM-DD'))
      setReport(res.data.data || null)
    } catch (error) {
      console.error('获取报告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [periodType, date])

  const chartOption = report ? {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: report.dailyProfits.map(p => p.date),
      axisLabel: { rotate: 45 },
    },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `¥${v}` } },
    series: [{
      name: '当日盈亏',
      type: 'bar',
      data: report.dailyProfits.map(p => ({
        value: p.profit,
        itemStyle: { color: p.profit >= 0 ? '#EF4444' : '#10B981' },
      })),
    }],
  } : {}

  const tradeColumns = [
    { title: '股票', key: 'stock', render: (_: unknown, r: TradeReview) => `${r.stockName}(${r.stockCode})` },
    { title: '买入日期', dataIndex: 'buyDate', key: 'buyDate' },
    { title: '卖出日期', dataIndex: 'sellDate', key: 'sellDate' },
    {
      title: '盈亏',
      key: 'profit',
      render: (_: unknown, r: TradeReview) => {
        const isProfit = (r.profit || 0) >= 0
        return (
          <Text style={{ color: isProfit ? '#EF4444' : '#10B981' }}>
            {isProfit ? '+' : ''}¥{(r.profit || 0).toFixed(2)}
          </Text>
        )
      },
    },
  ]

  const stockColumns = [
    { title: '股票', key: 'stock', render: (_: unknown, r: any) => `${r.stockName}(${r.stockCode})` },
    { title: '交易次数', dataIndex: 'tradeCount', key: 'tradeCount' },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? '#EF4444' : '#10B981' }}>
          {v >= 0 ? '+' : ''}¥{v.toFixed(2)}
        </Text>
      ),
    },
    {
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => <Tag color={v >= 50 ? 'red' : 'green'}>{v.toFixed(1)}%</Tag>,
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {periodType === 'week' ? '周报' : '月报'}
        </Title>
        <Space>
          <Radio.Group value={periodType} onChange={e => setPeriodType(e.target.value)}>
            <Radio.Button value="week">周报</Radio.Button>
            <Radio.Button value="month">月报</Radio.Button>
          </Radio.Group>
          <DatePicker
            value={date}
            onChange={d => d && setDate(d)}
            picker={periodType === 'week' ? 'week' : 'month'}
          />
        </Space>
      </div>

      <Spin spinning={loading}>
        {report ? (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Text type="secondary">
                统计周期: {report.period.start} ~ {report.period.end}
              </Text>
            </Card>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={4}>
                <Card size="small">
                  <Statistic title="交易次数" value={report.summary.totalTrades} suffix="笔" />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small">
                  <Statistic
                    title="胜率"
                    value={report.summary.winRate}
                    precision={1}
                    suffix="%"
                    valueStyle={{ color: report.summary.winRate >= 50 ? '#EF4444' : '#10B981' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small">
                  <Statistic
                    title="总盈亏"
                    value={report.summary.totalProfit}
                    precision={2}
                    prefix={report.summary.totalProfit >= 0 ? '+¥' : '¥'}
                    valueStyle={{ color: report.summary.totalProfit >= 0 ? '#EF4444' : '#10B981' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small">
                  <Statistic
                    title="平均盈利"
                    value={report.summary.avgProfit}
                    precision={2}
                    prefix="+¥"
                    valueStyle={{ color: '#EF4444' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small">
                  <Statistic
                    title="平均亏损"
                    value={Math.abs(report.summary.avgLoss)}
                    precision={2}
                    prefix="-¥"
                    valueStyle={{ color: '#10B981' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={4}>
                <Card size="small">
                  <Statistic
                    title="盈亏比"
                    value={report.summary.profitFactor}
                    precision={2}
                    valueStyle={{ color: report.summary.profitFactor >= 1 ? '#EF4444' : '#10B981' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="每日盈亏" style={{ marginBottom: 16 }}>
              {report.dailyProfits.length > 0 ? (
                <ReactECharts option={chartOption} style={{ height: 300 }} />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={12}>
                <Card title="最佳交易" size="small">
                  {report.topWinners.length > 0 ? (
                    <Table
                      columns={tradeColumns}
                      dataSource={report.topWinners}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Empty description="暂无数据" />
                  )}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="最差交易" size="small">
                  {report.topLosers.length > 0 ? (
                    <Table
                      columns={tradeColumns}
                      dataSource={report.topLosers}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Empty description="暂无数据" />
                  )}
                </Card>
              </Col>
            </Row>

            <Card title="股票统计">
              {report.stockStats.length > 0 ? (
                <Table
                  columns={stockColumns}
                  dataSource={report.stockStats}
                  rowKey="stockCode"
                  pagination={false}
                />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </>
        ) : (
          <Card>
            <Empty description="暂无报告数据" />
          </Card>
        )}
      </Spin>
    </div>
  )
}

export default AnalysisReportPage
