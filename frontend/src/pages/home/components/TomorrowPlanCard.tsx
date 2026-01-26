import React from 'react'
import { Card, Statistic, Row, Col, Empty, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  EyeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  StopOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'
import type { TomorrowPlanOverview } from '@/types/dashboard'

interface TomorrowPlanCardProps {
  data: TomorrowPlanOverview | null
  loading?: boolean
}

const TomorrowPlanCard: React.FC<TomorrowPlanCardProps> = ({ data, loading }) => {
  const navigate = useNavigate()

  if (!data?.hasPlan) {
    return (
      <Card
        title={
          <span>
            <ScheduleOutlined style={{ marginRight: 8 }} />
            明日计划
          </span>
        }
        loading={loading}
      >
        <Empty
          description="今日尚未设置明日计划"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate('/diary/plan')}>
            立即设置
          </Button>
        </Empty>
      </Card>
    )
  }

  return (
    <Card
      title={
        <span>
          <ScheduleOutlined style={{ marginRight: 8 }} />
          明日计划
        </span>
      }
      loading={loading}
      extra={
        <a onClick={() => navigate('/diary/plan')}>编辑计划</a>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Statistic
            title={
              <span>
                <EyeOutlined style={{ marginRight: 4 }} />
                关注股票
              </span>
            }
            value={data.watchStockCount}
            suffix="只"
            valueStyle={{ color: '#1890FF' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={
              <span>
                <ShoppingCartOutlined style={{ marginRight: 4 }} />
                买入计划
              </span>
            }
            value={data.buyPlanCount}
            suffix="个"
            valueStyle={{ color: '#F5222D' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={
              <span>
                <DollarOutlined style={{ marginRight: 4 }} />
                卖出计划
              </span>
            }
            value={data.sellPlanCount}
            suffix="个"
            valueStyle={{ color: '#52C41A' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={
              <span>
                <StopOutlined style={{ marginRight: 4 }} />
                止损设置
              </span>
            }
            value={data.stopLossCount}
            suffix="个"
            valueStyle={{ color: '#FA8C16' }}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default TomorrowPlanCard
