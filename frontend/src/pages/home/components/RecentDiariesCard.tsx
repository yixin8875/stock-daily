import React from 'react'
import { Card, List, Typography, Tag, Empty } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { RecentDiary } from '@/types/dashboard'

const { Text } = Typography

interface RecentDiariesCardProps {
  data: RecentDiary[]
  loading?: boolean
}

const RecentDiariesCard: React.FC<RecentDiariesCardProps> = ({ data, loading }) => {
  const navigate = useNavigate()

  const formatProfit = (value: number | null) => {
    if (value === null) return '--'
    const prefix = value >= 0 ? '+' : ''
    return `${prefix}${value.toFixed(2)}`
  }

  const formatDate = (date: string) => {
    const d = dayjs(date)
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${d.format('MM-DD')} ${weekdays[d.day()]}`
  }

  return (
    <Card
      title={
        <span>
          <FileTextOutlined style={{ marginRight: 8 }} />
          最近日记
        </span>
      }
      loading={loading}
      extra={
        <a onClick={() => navigate('/history')}>查看全部</a>
      }
    >
      {data.length === 0 ? (
        <Empty description="暂无日记记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/history?date=${item.date}`)}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong>{formatDate(item.date)}</Text>
                    <Tag
                      color={item.todayProfit !== null && item.todayProfit >= 0 ? 'red' : 'green'}
                      style={{ margin: 0 }}
                    >
                      {formatProfit(item.todayProfit)}元
                    </Tag>
                  </div>
                }
                description={
                  <Text
                    type="secondary"
                    ellipsis={{ tooltip: item.summary }}
                    style={{ maxWidth: '100%' }}
                  >
                    {item.summary}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}

export default RecentDiariesCard
