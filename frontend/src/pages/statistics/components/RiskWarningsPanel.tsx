import React from 'react'
import { Card, List, Tag, Badge, Space, Typography, Button, Empty, Spin } from 'antd'
import {
  AlertOutlined, WarningOutlined, InfoCircleOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons'
import type { RiskWarning } from '@/types/statistics'

const { Text } = Typography

interface RiskWarningsPanelProps {
  warnings: RiskWarning[]
  loading: boolean
  onMarkRead?: (id: string) => void
}

const warningTypeConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  DRAWDOWN: { icon: <ExclamationCircleOutlined />, label: '回撤预警' },
  CONSECUTIVE_LOSS: { icon: <WarningOutlined />, label: '连续亏损' },
  OVERTRADING: { icon: <AlertOutlined />, label: '过度交易' },
  CONCENTRATION: { icon: <InfoCircleOutlined />, label: '集中度风险' },
  VOLATILITY: { icon: <AlertOutlined />, label: '波动率异常' },
}

const levelConfig: Record<string, { color: string; badge: 'error' | 'warning' | 'processing' }> = {
  danger: { color: 'red', badge: 'error' },
  warning: { color: 'orange', badge: 'warning' },
  info: { color: 'blue', badge: 'processing' },
}

// 单个预警项组件
const WarningItem: React.FC<{
  item: RiskWarning
  onMarkRead?: (id: string) => void
}> = ({ item, onMarkRead }) => {
  const typeInfo = warningTypeConfig[item.type] || { icon: <AlertOutlined />, label: '未知' }
  const levelInfo = levelConfig[item.level] || levelConfig.info

  return (
    <List.Item
      style={{
        background: item.isRead ? 'transparent' : 'rgba(255, 77, 79, 0.05)',
        padding: '12px 16px',
        borderRadius: 8,
        marginBottom: 8
      }}
      actions={!item.isRead && onMarkRead ? [
        <Button size="small" type="link" onClick={() => onMarkRead(item.id)}>
          标记已读
        </Button>
      ] : undefined}
    >
      <List.Item.Meta
        avatar={
          <Badge status={levelInfo.badge}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: `${levelInfo.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: levelInfo.color, fontSize: 18
            }}>
              {typeInfo.icon}
            </div>
          </Badge>
        }
        title={
          <Space>
            <Tag color={levelInfo.color}>{typeInfo.label}</Tag>
            <Text strong>{item.title}</Text>
          </Space>
        }
        description={
          <Space direction="vertical" size={4}>
            <Text type="secondary">{item.message}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              当前值: {item.value.toFixed(2)} | 阈值: {item.threshold.toFixed(2)}
            </Text>
          </Space>
        }
      />
    </List.Item>
  )
}

const RiskWarningsPanel: React.FC<RiskWarningsPanelProps> = ({ warnings, loading, onMarkRead }) => {
  if (loading) {
    return (
      <Card title={<><AlertOutlined /> 风险预警</>}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  const unreadCount = warnings.filter(w => !w.isRead).length

  return (
    <Card
      title={
        <Space>
          <AlertOutlined style={{ color: '#FF4D4F' }} />
          <span>风险预警</span>
          {unreadCount > 0 && <Badge count={unreadCount} />}
        </Space>
      }
    >
      {warnings.length === 0 ? (
        <Empty
          image={<CheckCircleOutlined style={{ fontSize: 48, color: '#52C41A' }} />}
          description="暂无风险预警，交易状态良好"
        />
      ) : (
        <List
          dataSource={warnings}
          renderItem={(item) => (
            <WarningItem item={item} onMarkRead={onMarkRead} />
          )}
        />
      )}
    </Card>
  )
}

export default RiskWarningsPanel
