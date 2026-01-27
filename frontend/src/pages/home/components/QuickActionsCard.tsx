import React from 'react'
import { Card, Row, Col, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  EditOutlined,
  ScheduleOutlined,
  HistoryOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useThemeStore } from '@/stores'

interface QuickAction {
  icon: React.ReactNode
  title: string
  description: string
  path: string
  gradient: string
}

const quickActions: QuickAction[] = [
  {
    icon: <EditOutlined style={{ fontSize: 24 }} />,
    title: '今日总结',
    description: '记录今天的交易',
    path: '/diary/today',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
  },
  {
    icon: <ScheduleOutlined style={{ fontSize: 24 }} />,
    title: '明日计划',
    description: '规划明天的操作',
    path: '/diary/plan',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  },
  {
    icon: <HistoryOutlined style={{ fontSize: 24 }} />,
    title: '历史回顾',
    description: '查看过往记录',
    path: '/history',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 24 }} />,
    title: '统计分析',
    description: '分析交易表现',
    path: '/statistics',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  },
]

const QuickActionsCard: React.FC = () => {
  const navigate = useNavigate()
  const { mode } = useThemeStore()

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, #F59E0B 0%, #D97706 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ThunderboltOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>快捷入口</span>
        </Space>
      }
      styles={{
        body: { padding: 20 },
      }}
    >
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
                padding: '24px 16px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.15)'
                e.currentTarget.style.borderColor = 'transparent'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#E2E8F0'
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: action.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {action.icon}
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 4,
                  color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                }}
              >
                {action.title}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: mode === 'dark' ? '#94A3B8' : '#64748B',
                }}
              >
                {action.description}
              </span>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default QuickActionsCard
