import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Spin, Empty, Segmented } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { stockService, type MoneyFlow } from '@/services'

const MoneyFlowPanel: React.FC = () => {
  const [data, setData] = useState<MoneyFlow[]>([])
  const [loading, setLoading] = useState(false)
  const [viewType, setViewType] = useState<'table' | 'chart'>('table')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await stockService.getMoneyFlow()
      setData(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 100000000) {
      return `${(value / 100000000).toFixed(2)}亿`
    }
    if (absValue >= 10000) {
      return `${(value / 10000).toFixed(2)}万`
    }
    return value.toFixed(2)
  }

  const columns = [
    { title: '股票代码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '股票名称', dataIndex: 'name', key: 'name', width: 100 },
    {
      title: '主力净流入',
      dataIndex: 'mainNet',
      key: 'mainNet',
      sorter: (a: MoneyFlow, b: MoneyFlow) => a.mainNet - b.mainNet,
      render: (val: number) => (
        <span style={{ color: val >= 0 ? '#cf1322' : '#3f8600' }}>
          {val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {formatAmount(val)}
        </span>
      ),
    },
    {
      title: '散户净流入',
      dataIndex: 'retailNet',
      key: 'retailNet',
      render: (val: number) => (
        <span style={{ color: val >= 0 ? '#cf1322' : '#3f8600' }}>
          {formatAmount(val)}
        </span>
      ),
    },
    {
      title: '主力占比',
      dataIndex: 'mainNetRatio',
      key: 'mainNetRatio',
      render: (val: number) => (
        <Tag color={val >= 0 ? 'red' : 'green'}>{val.toFixed(2)}%</Tag>
      ),
    },
  ]

  const getChartOption = () => {
    const sortedData = [...data].sort((a, b) => b.mainNet - a.mainNet).slice(0, 10)
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['主力净流入', '散户净流入'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { formatter: (v: number) => formatAmount(v) } },
      yAxis: { type: 'category', data: sortedData.map(d => d.name) },
      series: [
        {
          name: '主力净流入',
          type: 'bar',
          data: sortedData.map(d => d.mainNet),
          itemStyle: { color: (p: { value: number }) => p.value >= 0 ? '#cf1322' : '#3f8600' },
        },
        {
          name: '散户净流入',
          type: 'bar',
          data: sortedData.map(d => d.retailNet),
          itemStyle: { color: '#1890ff' },
        },
      ],
    }
  }

  return (
    <Card
      title="资金流向分析"
      extra={
        <Segmented
          options={[
            { label: '表格', value: 'table' },
            { label: '图表', value: 'chart' },
          ]}
          value={viewType}
          onChange={(v) => setViewType(v as 'table' | 'chart')}
        />
      }
    >
      <Spin spinning={loading}>
        {data.length === 0 ? (
          <Empty description="暂无数据" />
        ) : viewType === 'table' ? (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="code"
            size="small"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <ReactECharts option={getChartOption()} style={{ height: 400 }} />
        )}
      </Spin>
    </Card>
  )
}

export default MoneyFlowPanel
