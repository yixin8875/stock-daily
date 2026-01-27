import React, { useEffect, useState } from 'react'
import { Card, List, Typography, Space, Tag, Spin, Button, Empty } from 'antd'
import { ReloadOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { stockService, type StockNews } from '@/services'

const { Title, Text, Paragraph } = Typography

const NewsPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [news, setNews] = useState<StockNews[]>([])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await stockService.getStockNews()
      setNews(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>财经资讯</Title>
        <Button icon={<ReloadOutlined />} onClick={fetchNews} loading={loading}>
          刷新
        </Button>
      </div>

      <Spin spinning={loading}>
        {news.length > 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
            dataSource={news}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => window.open(item.url, '_blank')}
                  style={{ height: '100%' }}
                >
                  <Title level={5} style={{ marginBottom: 8 }} ellipsis={{ rows: 2 }}>
                    {item.title}
                  </Title>
                  <Paragraph type="secondary" ellipsis={{ rows: 3 }} style={{ marginBottom: 12 }}>
                    {item.summary}
                  </Paragraph>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Tag color="blue">{item.source}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.time}
                    </Text>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Card>
            <Empty description="暂无新闻" />
          </Card>
        )}
      </Spin>
    </div>
  )
}

export default NewsPage
