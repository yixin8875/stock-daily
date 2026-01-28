import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Row, Col, Spin } from 'antd'
import { RiseOutlined, FallOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { stockService, type SectorData, type SectorRotation } from '@/services'

// 板块轮动图表子组件
const SectorRotationChart: React.FC<{ rotation: SectorRotation[] }> = ({ rotation }) => {
  if (rotation.length === 0) return null

  const dates = rotation.map(r => r.date)
  const sectorNames = [...new Set(rotation.flatMap(r => r.sectors.map(s => s.name)))].slice(0, 8)

  const series = sectorNames.map(name => ({
    name,
    type: 'line',
    data: rotation.map(r => {
      const sector = r.sectors.find(s => s.name === name)
      return sector?.changePercent || 0
    }),
  }))

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: sectorNames, bottom: 0 },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series,
  }

  return (
    <Card type="inner" title="板块走势对比" style={{ marginTop: 16 }}>
      <ReactECharts option={option} style={{ height: 300 }} />
    </Card>
  )
}

const SectorRotationAnalysis: React.FC = () => {
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [rotation, setRotation] = useState<SectorRotation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sectorsRes, rotationRes] = await Promise.all([
        stockService.getSectors(),
        stockService.getSectorRotation(5),
      ])
      setSectors(sectorsRes.data.data || [])
      setRotation(rotationRes.data.data || [])
    } catch {
      setSectors([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '板块', dataIndex: 'name', key: 'name', width: 120 },
    {
      title: '涨跌幅', dataIndex: 'changePercent', key: 'changePercent',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#EF4444' : '#10B981' }}>
          {v >= 0 ? <RiseOutlined /> : <FallOutlined />} {v >= 0 ? '+' : ''}{v.toFixed(2)}%
        </span>
      ),
      sorter: (a: SectorData, b: SectorData) => b.changePercent - a.changePercent,
    },
    {
      title: '领涨股', key: 'leading',
      render: (_: unknown, r: SectorData) => (
        <span>
          {r.leadingStock}
          <Tag color={r.leadingStockChange >= 0 ? 'red' : 'green'} style={{ marginLeft: 8 }}>
            {r.leadingStockChange >= 0 ? '+' : ''}{r.leadingStockChange.toFixed(2)}%
          </Tag>
        </span>
      ),
    },
    {
      title: '成交额', dataIndex: 'amount', key: 'amount',
      render: (v: number) => `${(v / 100000000).toFixed(2)}亿`,
    },
  ]

  const topSectors = [...sectors].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  const bottomSectors = [...sectors].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  return (
    <Card title="板块轮动分析">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card type="inner" title={<span style={{ color: '#EF4444' }}>领涨板块</span>} size="small">
              {topSectors.map((s, i) => (
                <div key={s.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>{i + 1}. {s.name}</span>
                  <Tag color="red">+{s.changePercent.toFixed(2)}%</Tag>
                </div>
              ))}
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner" title={<span style={{ color: '#10B981' }}>领跌板块</span>} size="small">
              {bottomSectors.map((s, i) => (
                <div key={s.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>{i + 1}. {s.name}</span>
                  <Tag color="green">{s.changePercent.toFixed(2)}%</Tag>
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        <SectorRotationChart rotation={rotation} />

        <Table
          columns={columns}
          dataSource={sectors}
          rowKey="code"
          pagination={{ pageSize: 10 }}
          size="small"
          style={{ marginTop: 16 }}
        />
      </Spin>
    </Card>
  )
}

export default SectorRotationAnalysis
