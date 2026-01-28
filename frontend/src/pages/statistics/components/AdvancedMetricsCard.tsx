import React from 'react'
import { Card, Row, Col, Statistic, Spin, Tooltip, Space, Typography } from 'antd'
import {
  InfoCircleOutlined, TrophyOutlined, ThunderboltOutlined,
  FieldTimeOutlined, FireOutlined, SafetyOutlined
} from '@ant-design/icons'
import type { AdvancedMetrics } from '@/types/statistics'

const { Text } = Typography

interface AdvancedMetricsCardProps {
  metrics: AdvancedMetrics | null
  loading: boolean
}

const PROFIT_COLOR = '#F5222D'
const LOSS_COLOR = '#52C41A'

const AdvancedMetricsCard: React.FC<AdvancedMetricsCardProps> = ({ metrics, loading }) => {
  if (loading) {
    return (
      <Card title={<><ThunderboltOutlined /> 高级交易指标</>}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card title={<><ThunderboltOutlined /> 高级交易指标</>}>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          暂无数据
        </div>
      </Card>
    )
  }

  const getStreakColor = () => {
    if (metrics.currentStreakType === 'win') return PROFIT_COLOR
    if (metrics.currentStreakType === 'loss') return LOSS_COLOR
    return '#999'
  }

  const getStreakText = () => {
    if (metrics.currentStreakType === 'win') return `连胜 ${metrics.currentStreak} 次`
    if (metrics.currentStreakType === 'loss') return `连亏 ${metrics.currentStreak} 次`
    return '无连续记录'
  }

  return (
    <Card title={<><ThunderboltOutlined style={{ marginRight: 8 }} />高级交易指标</>}>
      <Row gutter={[16, 24]}>
        {/* 期望值 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <span>期望值</span>
                <Tooltip title="每笔交易的期望收益 = 胜率×平均盈利 - (1-胜率)×平均亏损。正值表示长期盈利">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            value={metrics.expectancy}
            precision={2}
            prefix="¥"
            valueStyle={{ color: metrics.expectancy >= 0 ? PROFIT_COLOR : LOSS_COLOR }}
          />
        </Col>

        {/* 凯利公式 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <span>凯利仓位</span>
                <Tooltip title="凯利公式计算的最优仓位比例。建议实际使用1/2凯利以降低风险">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            value={metrics.kellyPercent}
            precision={1}
            suffix="%"
            valueStyle={{ color: metrics.kellyPercent > 0 ? '#1890FF' : '#999' }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            建议: {(metrics.kellyPercent / 2).toFixed(1)}%
          </Text>
        </Col>

        {/* 夏普比率 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <span>夏普比率</span>
                <Tooltip title="风险调整后收益。>1优秀，>2非常好，>3极佳">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            value={metrics.sharpeRatio}
            precision={2}
            valueStyle={{ color: metrics.sharpeRatio >= 1 ? PROFIT_COLOR : LOSS_COLOR }}
          />
        </Col>

        {/* 索提诺比率 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <span>索提诺比率</span>
                <Tooltip title="只考虑下行风险的收益比率，比夏普比率更关注亏损风险">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            value={metrics.sortinoRatio}
            precision={2}
            valueStyle={{ color: metrics.sortinoRatio >= 1 ? PROFIT_COLOR : LOSS_COLOR }}
          />
        </Col>

        {/* 卡玛比率 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <span>卡玛比率</span>
                <Tooltip title="年化收益率/最大回撤。>3优秀，衡量收益与风险的平衡">
                  <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                </Tooltip>
              </Space>
            }
            value={metrics.calmarRatio}
            precision={2}
            valueStyle={{ color: metrics.calmarRatio >= 1 ? PROFIT_COLOR : LOSS_COLOR }}
          />
        </Col>

        {/* 最大回撤 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <SafetyOutlined />
                <span>最大回撤</span>
              </Space>
            }
            value={metrics.maxDrawdownRate}
            precision={2}
            suffix="%"
            valueStyle={{ color: LOSS_COLOR }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            持续 {metrics.maxDrawdownDays} 天
          </Text>
        </Col>

        {/* 平均持仓 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <FieldTimeOutlined />
                <span>平均持仓</span>
              </Space>
            }
            value={metrics.avgHoldingDays}
            precision={1}
            suffix="天"
          />
        </Col>

        {/* 交易频率 */}
        <Col xs={12} sm={8} md={6}>
          <Statistic
            title={
              <Space>
                <FireOutlined />
                <span>月交易频率</span>
              </Space>
            }
            value={metrics.tradeFrequency}
            precision={1}
            suffix="次/月"
          />
        </Col>
      </Row>

      {/* 连续盈亏记录 */}
      <div style={{ marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: 8 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space>
              <TrophyOutlined style={{ color: PROFIT_COLOR }} />
              <Text>最大连胜: <Text strong style={{ color: PROFIT_COLOR }}>{metrics.maxConsecutiveWins}</Text> 次</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <TrophyOutlined style={{ color: LOSS_COLOR }} />
              <Text>最大连亏: <Text strong style={{ color: LOSS_COLOR }}>{metrics.maxConsecutiveLosses}</Text> 次</Text>
            </Space>
          </Col>
          <Col span={8}>
            <Space>
              <ThunderboltOutlined style={{ color: getStreakColor() }} />
              <Text>当前: <Text strong style={{ color: getStreakColor() }}>{getStreakText()}</Text></Text>
            </Space>
          </Col>
        </Row>
      </div>
    </Card>
  )
}

export default AdvancedMetricsCard
