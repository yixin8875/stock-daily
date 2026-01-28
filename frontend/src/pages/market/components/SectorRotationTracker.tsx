import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Space, Select, Row, Col, Statistic, Tooltip, message } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, FireOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { stockService } from '@/services'

interface SectorData {
  name: string
  code: string
  change: number
  volume: number
  turnover: number
  leadingStock: string
  rank: number
  rankChange: number
  hotLevel: number
}

const SectorRotationTracker: React.FC = () => {
  const [period, setPeriod] = useState<'1d' | '5d' | '20d'>('1d')
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSectorData()
  }, [period])

  const fetchSectorData = async () => {
    setLoading(true)
    const days = period === '1d' ? 1 : period === '5d' ? 5 : 20
    try {
      const res = await stockService.getSectorRotation(days)
      const rotationData = res.data.data || []
      if (rotationData.length > 0) {
        const latestSectors = rotationData[0].sectors || []
        const mappedData: SectorData[] = latestSectors.map((s, idx) => ({
          name: s.name,
          code: s.code,
          change: s.changePercent,
          volume: s.volume,
          turnover: 0,
          leadingStock: s.leadingStock,
          rank: idx + 1,
          rankChange: 0,
          hotLevel: Math.min(5, Math.max(1, Math.ceil(Math.abs(s.changePercent) / 2))),
        }))
        setSectors(mappedData)
      }
    } catch {
      message.error('获取板块数据失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      width: 80,
      render: (rank: number, record: SectorData) => (
        <Space>
          <span style={{ fontWeight: 'bold' }}>{rank}</span>
          {record.rankChange > 0 && <ArrowUpOutlined style={{ color: '#EF4444', fontSize: 12 }} />}
          {record.rankChange < 0 && <ArrowDownOutlined style={{ color: '#10B981', fontSize: 12 }} />}
        </Space>
      ),
    },
    {
      title: '板块名称',
      dataIndex: 'name',
      render: (name: string, record: SectorData) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.hotLevel >= 4 && <FireOutlined style={{ color: '#F59E0B' }} />}
        </Space>
      ),
    },
    {
      title: '涨跌幅',
      dataIndex: 'change',
      render: (change: number) => (
        <Tag color={change >= 0 ? 'red' : 'green'}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </Tag>
      ),
    },
    {
      title: '换手率',
      dataIndex: 'turnover',
      render: (val: number) => `${val.toFixed(1)}%`,
    },
    {
      title: '领涨股',
      dataIndex: 'leadingStock',
    },
    {
      title: '热度',
      dataIndex: 'hotLevel',
      render: (level: number) => (
        <Tooltip title={`热度等级: ${level}/5`}>
          {Array(level).fill('🔥').join('')}
        </Tooltip>
      ),
    },
  ]

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sectors.slice(0, 6).map(s => s.name),
    },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [{
      type: 'bar',
      data: sectors.slice(0, 6).map(s => ({
        value: s.change,
        itemStyle: { color: s.change >= 0 ? '#EF4444' : '#10B981' },
      })),
    }],
  }

  const topSectors = sectors.filter(s => s.change > 0).slice(0, 3)
  const bottomSectors = sectors.filter(s => s.change < 0).slice(-3)

  return (
    <Card
      title="板块轮动追踪"
      extra={
        <Select value={period} onChange={setPeriod} style={{ width: 100 }}>
          <Select.Option value="1d">今日</Select.Option>
          <Select.Option value="5d">5日</Select.Option>
          <Select.Option value="20d">20日</Select.Option>
        </Select>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="领涨板块"
              value={topSectors[0]?.name || '-'}
              valueStyle={{ color: '#EF4444', fontSize: 16 }}
              suffix={topSectors[0] ? `+${topSectors[0].change}%` : ''}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="领跌板块"
              value={bottomSectors[0]?.name || '-'}
              valueStyle={{ color: '#10B981', fontSize: 16 }}
              suffix={bottomSectors[0] ? `${bottomSectors[0].change}%` : ''}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title="活跃板块数" value={sectors.filter(s => s.hotLevel >= 4).length} suffix="个" />
          </Card>
        </Col>
      </Row>

      <ReactECharts option={chartOption} style={{ height: 200, marginBottom: 16 }} />

      <Table
        columns={columns}
        dataSource={sectors}
        rowKey="code"
        loading={loading}
        pagination={false}
        size="small"
      />
    </Card>
  )
}

export default SectorRotationTracker
