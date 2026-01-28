import React, { useState } from 'react'
import { Card, Tabs, Table, Spin, Empty, Progress, Tag, Space, Typography } from 'antd'
import { PieChartOutlined, BankOutlined, StockOutlined, BulbOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { ProfitAttribution, IndustryAttribution, StockAttribution, StrategyAttribution } from '@/types/statistics'

const { Text } = Typography
const PROFIT_COLOR = '#F5222D'
const LOSS_COLOR = '#52C41A'

interface ProfitAttributionChartProps {
  data: ProfitAttribution | null
  loading: boolean
}

const ProfitAttributionChart: React.FC<ProfitAttributionChartProps> = ({ data, loading }) => {
  const [activeTab, setActiveTab] = useState('industry')

  if (loading) {
    return (
      <Card title={<><PieChartOutlined /> 收益归因分析</>}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card title={<><PieChartOutlined /> 收益归因分析</>}>
        <Empty description="暂无归因数据" />
      </Card>
    )
  }

  // 行业归因饼图配置
  const industryPieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      data: data.byIndustry
        .filter(i => i.contribution !== 0)
        .map(i => ({
          name: i.industry,
          value: Math.abs(i.contribution).toFixed(1),
          itemStyle: { color: i.profit >= 0 ? PROFIT_COLOR : LOSS_COLOR }
        })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14 } }
    }]
  }

  // 行业表格列
  const industryColumns = [
    { title: '行业', dataIndex: 'industry', key: 'industry', render: (v: string) => <Text strong>{v}</Text> },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? PROFIT_COLOR : LOSS_COLOR }}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}
        </Text>
      ),
      sorter: (a: IndustryAttribution, b: IndustryAttribution) => a.profit - b.profit
    },
    {
      title: '贡献度',
      dataIndex: 'contribution',
      key: 'contribution',
      render: (v: number) => (
        <Progress
          percent={Math.abs(v)}
          size="small"
          strokeColor={v >= 0 ? PROFIT_COLOR : LOSS_COLOR}
          format={() => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
        />
      ),
      sorter: (a: IndustryAttribution, b: IndustryAttribution) => a.contribution - b.contribution
    },
    {
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => <Tag color={v >= 50 ? 'green' : 'red'}>{v.toFixed(1)}%</Tag>
    },
    { title: '交易次数', dataIndex: 'tradeCount', key: 'tradeCount' }
  ]

  return (
    <Card title={<><PieChartOutlined style={{ marginRight: 8 }} />收益归因分析</>}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'industry',
          label: <><BankOutlined /> 行业归因</>,
          children: <IndustryTab data={data.byIndustry} pieOption={industryPieOption} columns={industryColumns} />
        },
        {
          key: 'stock',
          label: <><StockOutlined /> 个股归因</>,
          children: <StockTab data={data.byStock} />
        },
        {
          key: 'strategy',
          label: <><BulbOutlined /> 策略归因</>,
          children: <StrategyTab data={data.byStrategy} />
        }
      ]} />
    </Card>
  )
}

// 行业归因Tab
const IndustryTab: React.FC<{
  data: IndustryAttribution[]
  pieOption: any
  columns: any[]
}> = ({ data, pieOption, columns }) => (
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
    <div style={{ flex: '1 1 300px', minWidth: 300 }}>
      <ReactECharts option={pieOption} style={{ height: 280 }} />
    </div>
    <div style={{ flex: '2 1 400px' }}>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="industry"
        size="small"
        pagination={false}
      />
    </div>
  </div>
)

// 策略归因Tab
const StrategyTab: React.FC<{ data: StrategyAttribution[] }> = ({ data }) => {
  const columns = [
    { title: '策略', dataIndex: 'strategy', key: 'strategy', render: (v: string) => <Text strong>{v}</Text> },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? PROFIT_COLOR : LOSS_COLOR }}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}
        </Text>
      ),
      sorter: (a: StrategyAttribution, b: StrategyAttribution) => a.profit - b.profit
    },
    {
      title: '贡献度',
      dataIndex: 'contribution',
      key: 'contribution',
      render: (v: number) => (
        <Progress
          percent={Math.abs(v)}
          size="small"
          strokeColor={v >= 0 ? PROFIT_COLOR : LOSS_COLOR}
          format={() => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
        />
      )
    },
    {
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => <Tag color={v >= 50 ? 'green' : 'red'}>{v.toFixed(1)}%</Tag>
    },
    { title: '交易次数', dataIndex: 'tradeCount', key: 'tradeCount' }
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="strategy"
      size="small"
      pagination={false}
    />
  )
}

// 个股归因Tab
const StockTab: React.FC<{ data: StockAttribution[] }> = ({ data }) => {
  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: unknown, r: StockAttribution) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.stockCode}</Text>
        </Space>
      )
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? PROFIT_COLOR : LOSS_COLOR }}>
          {v >= 0 ? '+' : ''}{v.toFixed(2)}
        </Text>
      ),
      sorter: (a: StockAttribution, b: StockAttribution) => a.profit - b.profit
    },
    {
      title: '贡献度',
      dataIndex: 'contribution',
      key: 'contribution',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'red' : 'green'}>{v >= 0 ? '+' : ''}{v.toFixed(1)}%</Tag>
      ),
      sorter: (a: StockAttribution, b: StockAttribution) => a.contribution - b.contribution
    },
    {
      title: '胜率',
      dataIndex: 'winRate',
      key: 'winRate',
      render: (v: number) => <Tag color={v >= 50 ? 'green' : 'red'}>{v.toFixed(1)}%</Tag>
    },
    { title: '交易次数', dataIndex: 'tradeCount', key: 'tradeCount' },
    {
      title: '平均持仓',
      dataIndex: 'avgHoldingDays',
      key: 'avgHoldingDays',
      render: (v: number) => `${v.toFixed(1)}天`
    }
  ]

  return (
    <Table
      dataSource={data}
      columns={columns}
      rowKey="stockCode"
      size="small"
      pagination={{ pageSize: 10 }}
    />
  )
}

export default ProfitAttributionChart
