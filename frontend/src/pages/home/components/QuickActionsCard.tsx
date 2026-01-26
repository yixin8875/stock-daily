import React from 'react'
import { Card, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  EditOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  BarChartOutlined,
} from '@ant-design/icons'

interface QuickAction {
  icon: React.ReactNode
  title: string
  path: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    icon: <EditOutlined style={{ fontSize: 32 }} />,
    title: '写今日总结',
    path: '/diary/today',
    color: '#1890FF',
  },
  {
    icon: <ScheduleOutlined style={{ fontSize: 32 }} />,
    title: '写明日计划',
    path: '/diary/plan',
    color: '#52C41A',
  },
  {
    icon: <HistoryOutlined style={{ fontSize: 32 }} />,
    title: '查看历史',
    path: '/history',
    color: '#722ED1',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 32 }} />,
    title: '统计分析',
    path: '/statistics',
    color: '#FA8C16',
  },
]

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Card title="快捷入口">
      <Row gutter={[16, 16]}>
        {quickActions.map((action) => (
          <Col xs={12} sm={6} key={action.path}>
            <div
              onClick={() => navigate(action.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                backgroundColor: '#fafafa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ color: action.color, marginBottom: 8 }}>
                {action.icon}
              </div>
              <span style={{ fontSize: 14, color: '#333' }}>{action.title}</span>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default QuickActionsCard
