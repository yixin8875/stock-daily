import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Alert, Spin } from 'antd'
import { FieldTimeOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { statisticsService } from '@/services'
import type { HoldingPeriodData } from '@/types/statistics'
import type { StatisticsPeriod } from '@/types/statistics'

interface Props {
  period: StatisticsPeriod
}

const HoldingPeriodAnalysis: React.FC<Props> = ({ period }) => {
  const [data, setData] = useState<HoldingPeriodData[]>([])
  const [optimal, setOptimal] = useState<{ period: string; periodLabel: string; reason: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await statisticsService.getHoldingPeriodAnalysis(period)
      setData(res.data.data?.data || [])
      setOptimal(res.data.data?.optimal || null)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: { data: ['交易次数', '胜率', '平均收益率'] },
    xAxis: {
      type: 'category',
      data: data.map(d => d.periodLabel),
    },
    yAxis: [
      { type: 'value', name: '次数', position: 'left' },
      { type: 'value', name: '%', position: 'right', axisLabel: { formatter: '{value}%' } },
    ],
    series: [
      {
        name: '交易次数',
        type: 'bar',
        data: data.map(d => d.tradeCount),
        itemStyle: { color: '#1890FF' },
      },
      {
        name: '胜率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => (d.winRate * 100).toFixed(1)),
        itemStyle: { color: '#52C41A' },
      },
      {
        name: '平均收益率',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => d.avgProfitRate.toFixed(2)),
        itemStyle: { color: '#FF4D4F' },
      },
    ],
  }

  return (
    <Card title={<><FieldTimeOutlined style={{ marginRight: 8 }} />持仓周期分析</>}>
      <Spin spinning={loading}>
        {optimal && (
          <Alert
            type="success"
            message={`最佳持仓周期: ${optimal.periodLabel}`}
            description={optimal.reason}
            style={{ marginBottom: 16 }}
          />
        )}
        <ReactECharts option={chartOption} style={{ height: 300 }} />
        <Row gutter={16} style={{ marginTop: 16 }}>
          {data.slice(0, 4).map(d => (
            <Col span={6} key={d.period}>
              <Statistic
                title={d.periodLabel}
                value={d.winRate * 100}
                precision={1}
                suffix={`% (${d.tradeCount}笔)`}
                valueStyle={{ color: d.winRate >= 0.5 ? '#52C41A' : '#FF4D4F' }}
              />
            </Col>
          ))}
        </Row>
      </Spin>
    </Card>
  )
}

export default HoldingPeriodAnalysis
