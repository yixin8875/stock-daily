import React, { useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Select,
  DatePicker,
  Space,
  Typography,
  Tag,
  Spin,
  Empty,
  Progress,
} from 'antd'
import {
  PlayCircleOutlined,
  TrophyOutlined,
  FallOutlined,
  RiseOutlined,
  PercentageOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { backtestService, type BacktestResult, type BacktestTrade } from '@/services'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const BacktestPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [strategyType, setStrategyType] = useState('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const runBacktest = async () => {
    setLoading(true)
    try {
      const response = await backtestService.runBacktest(
        strategyType,
        dateRange?.[0]?.format('YYYY-MM-DD'),
        dateRange?.[1]?.format('YYYY-MM-DD')
      )
      setResult(response.data.data)
    } catch (error) {
      console.error('Failed to run backtest:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: any, record: BacktestTrade) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.stockName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.stockCode}</Text>
        </Space>
      ),
    },
    {
      title: '买入',
      key: 'buy',
      render: (_: any, record: BacktestTrade) => (
        <Space direction="vertical" size={0}>
          <Text>¥{record.buyPrice.toFixed(2)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.buyDate}</Text>
        </Space>
      ),
    },
    {
      title: '卖出',
      key: 'sell',
      render: (_: any, record: BacktestTrade) => (
        <Space direction="vertical" size={0}>
          <Text>¥{record.sellPrice.toFixed(2)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.sellDate}</Text>
        </Space>
      ),
    },
    {
      title: '持有天数',
      dataIndex: 'holdingDays',
      key: 'holdingDays',
      render: (days: number) => `${days}天`,
    },
    {
      title: '盈亏',
      key: 'profit',
      render: (_: any, record: BacktestTrade) => (
        <Space direction="vertical" size={0}>
          <Text style={{ color: record.profit >= 0 ? '#10B981' : '#EF4444' }}>
            {record.profit >= 0 ? '+' : ''}{record.profit.toFixed(2)}
          </Text>
          <Tag color={record.profitRate >= 0 ? 'green' : 'red'}>
            {record.profitRate >= 0 ? '+' : ''}{record.profitRate.toFixed(2)}%
          </Tag>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>策略回测</Title>

      {/* 参数设置 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <Select
            value={strategyType}
            onChange={setStrategyType}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: '全部交易' },
              { value: 'trend', label: '趋势跟踪' },
              { value: 'swing', label: '波段交易' },
              { value: 'value', label: '价值投资' },
            ]}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
          />
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={runBacktest}
            loading={loading}
          >
            运行回测
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {result ? (
          <>
            {/* 回测结果概览 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="总交易次数"
                    value={result.totalTrades}
                    prefix={<TrophyOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="胜率"
                    value={result.winRate}
                    suffix="%"
                    valueStyle={{ color: result.winRate >= 50 ? '#10B981' : '#EF4444' }}
                    prefix={<PercentageOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="总收益"
                    value={result.totalProfit}
                    precision={2}
                    prefix={result.totalProfit >= 0 ? <RiseOutlined /> : <FallOutlined />}
                    valueStyle={{ color: result.totalProfit >= 0 ? '#10B981' : '#EF4444' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="收益率"
                    value={result.totalProfitRate}
                    suffix="%"
                    valueStyle={{ color: result.totalProfitRate >= 0 ? '#10B981' : '#EF4444' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="最大回撤"
                    value={result.maxDrawdownRate}
                    suffix="%"
                    valueStyle={{ color: '#EF4444' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="盈亏比"
                    value={result.profitFactor}
                    precision={2}
                  />
                </Card>
              </Col>
            </Row>

            {/* 胜率进度条 */}
            <Card style={{ marginBottom: 24 }}>
              <Row gutter={24}>
                <Col span={12}>
                  <Text>盈利交易: {result.winningTrades}</Text>
                  <Progress
                    percent={result.winRate}
                    strokeColor="#10B981"
                    trailColor="#EF4444"
                  />
                </Col>
                <Col span={12}>
                  <Space>
                    <Text>平均盈利: ¥{result.avgProfit.toFixed(2)}</Text>
                    <Text type="secondary">|</Text>
                    <Text>平均亏损: ¥{result.avgLoss.toFixed(2)}</Text>
                    <Text type="secondary">|</Text>
                    <Text>平均持仓: {result.avgHoldingDays}天</Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* 交易明细 */}
            <Card title="交易明细">
              <Table
                columns={columns}
                dataSource={result.trades}
                rowKey={(record) => `${record.stockCode}-${record.buyDate}-${record.sellDate}`}
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            </Card>
          </>
        ) : (
          <Card>
            <Empty description='点击"运行回测"开始分析您的历史交易数据' />
          </Card>
        )}
      </Spin>
    </div>
  )
}

export default BacktestPage
