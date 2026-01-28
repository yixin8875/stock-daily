import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Collapse, Statistic, Row, Col, Spin, Empty } from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import { statisticsService } from '@/services'
import type { TradeError, TradeErrorType, StatisticsPeriod } from '@/types/statistics'

const errorTypeColors: Record<TradeErrorType, string> = {
  CHASE_HIGH: 'red',
  PANIC_SELL: 'orange',
  HOLD_LOSS: 'volcano',
  EARLY_SELL: 'gold',
  OVERTRADING: 'purple',
  NO_STOP_LOSS: 'magenta',
}

// 错误详情子组件
const ErrorDetail: React.FC<{ error: TradeError }> = ({ error }) => {
  const columns = [
    { title: '股票', dataIndex: 'stockName', key: 'stock' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '损失', dataIndex: 'loss', key: 'loss', render: (v: number) => <span style={{ color: '#EF4444' }}>¥{v.toFixed(0)}</span> },
    { title: '描述', dataIndex: 'description', key: 'desc' },
  ]
  return (
    <div>
      <p style={{ marginBottom: 8, color: '#1890FF' }}><strong>改进建议:</strong> {error.suggestion}</p>
      <Table columns={columns} dataSource={error.examples} rowKey="tradeId" size="small" pagination={false} />
    </div>
  )
}

interface Props {
  period: StatisticsPeriod
}

const TradeErrorAnalysis: React.FC<Props> = ({ period }) => {
  const [errors, setErrors] = useState<TradeError[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await statisticsService.getTradeErrors(period)
      setErrors(res.data.data?.errors || [])
      setTotalCount(res.data.data?.totalErrorCount || 0)
    } catch {
      setErrors([])
    } finally {
      setLoading(false)
    }
  }

  const collapseItems = errors.map(err => ({
    key: err.type,
    label: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span><Tag color={errorTypeColors[err.type]}>{err.label}</Tag> {err.count}次</span>
        <span style={{ color: '#EF4444' }}>损失: ¥{err.totalLoss.toFixed(0)}</span>
      </div>
    ),
    children: <ErrorDetail error={err} />
  }))

  return (
    <Card title={<><WarningOutlined style={{ marginRight: 8 }} />交易错误分析</>}>
      <Spin spinning={loading}>
        {errors.length > 0 ? (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}><Statistic title="错误总数" value={totalCount} suffix="次" /></Col>
              <Col span={8}><Statistic title="错误类型" value={errors.length} suffix="种" /></Col>
              <Col span={8}><Statistic title="总损失" value={errors.reduce((s, e) => s + e.totalLoss, 0)} prefix="¥" valueStyle={{ color: '#EF4444' }} /></Col>
            </Row>
            <Collapse items={collapseItems} />
          </>
        ) : (
          <Empty description="暂无交易错误数据" />
        )}
      </Spin>
    </Card>
  )
}

export default TradeErrorAnalysis
