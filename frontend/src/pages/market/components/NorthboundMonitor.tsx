import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Select, message, Button, Switch, Space } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { stockService, type NorthFlowData, type NorthTopStock } from '@/services'

const NorthboundMonitor: React.FC = () => {
  const [period, setPeriod] = useState<'1d' | '5d' | '20d'>('5d')
  const [flowData, setFlowData] = useState<NorthFlowData[]>([])
  const [topStocks, setTopStocks] = useState<NorthTopStock[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchData()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    const days = period === '1d' ? 1 : period === '5d' ? 5 : 20
    try {
      const [flowRes, topRes] = await Promise.all([
        stockService.getNorthFlow(days),
        stockService.getNorthTopStocks(5),
      ])
      setFlowData(flowRes.data.data || [])
      setTopStocks(topRes.data.data || [])
    } catch {
      message.error('获取北向资金数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(fetchData, 60000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoRefresh])

  const exportToCSV = () => {
    const headers = ['日期', '沪股通(亿)', '深股通(亿)', '合计(亿)']
    const rows = flowData.map(d => [d.date, d.shConnect, d.szConnect, d.total])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `北向资金_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const todayData = flowData[flowData.length - 1] || { shConnect: 0, szConnect: 0, total: 0 }

  const chartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['沪股通', '深股通', '合计'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: flowData.map(d => d.date) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}亿' } },
    series: [
      { name: '沪股通', type: 'bar', stack: 'total', data: flowData.map(d => d.shConnect.toFixed(2)) },
      { name: '深股通', type: 'bar', stack: 'total', data: flowData.map(d => d.szConnect.toFixed(2)) },
      { name: '合计', type: 'line', data: flowData.map(d => d.total.toFixed(2)) },
    ],
  }

  const columns = [
    { title: '排名', dataIndex: 'rank', width: 60 },
    { title: '代码', dataIndex: 'code', width: 80 },
    { title: '名称', dataIndex: 'name' },
    {
      title: '净买入(亿)',
      dataIndex: 'netBuy',
      render: (val: number) => (
        <span style={{ color: val >= 0 ? '#EF4444' : '#10B981' }}>
          {val >= 0 ? '+' : ''}{val.toFixed(2)}
        </span>
      ),
    },
    {
      title: '涨跌幅',
      dataIndex: 'change',
      render: (val: number) => (
        <Tag color={val >= 0 ? 'red' : 'green'}>{val >= 0 ? '+' : ''}{val.toFixed(2)}%</Tag>
      ),
    },
  ]

  return (
    <Card
      title="北向资金监控"
      extra={
        <Space>
          <Select value={period} onChange={setPeriod} style={{ width: 100 }}>
            <Select.Option value="1d">今日</Select.Option>
            <Select.Option value="5d">5日</Select.Option>
            <Select.Option value="20d">20日</Select.Option>
          </Select>
          <span>自动刷新</span>
          <Switch size="small" checked={autoRefresh} onChange={setAutoRefresh} />
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} />
          <Button icon={<DownloadOutlined />} onClick={exportToCSV} />
        </Space>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="沪股通"
              value={todayData.shConnect}
              precision={2}
              prefix={todayData.shConnect >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="亿"
              valueStyle={{ color: todayData.shConnect >= 0 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="深股通"
              value={todayData.szConnect}
              precision={2}
              prefix={todayData.szConnect >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="亿"
              valueStyle={{ color: todayData.szConnect >= 0 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="合计"
              value={todayData.total}
              precision={2}
              prefix={todayData.total >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="亿"
              valueStyle={{ color: todayData.total >= 0 ? '#EF4444' : '#10B981' }}
            />
          </Card>
        </Col>
      </Row>

      <ReactECharts option={chartOption} style={{ height: 250, marginBottom: 16 }} />

      <Card size="small" title="北向资金净买入TOP5">
        <Table columns={columns} dataSource={topStocks} rowKey="code" loading={loading} pagination={false} size="small" />
      </Card>
    </Card>
  )
}

export default NorthboundMonitor
