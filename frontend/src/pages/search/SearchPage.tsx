import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input, List, Pagination, Empty, Spin, Card, Tag, Typography } from 'antd'
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons'
import { useSearchStore } from '@/stores/searchStore'
import { FIELD_LABELS } from '@/types/search'

const { Search } = Input
const { Text } = Typography

const SearchPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    keyword,
    results,
    loading,
    total,
    page,
    pageSize,
    hasSearched,
    setKeyword,
    setPage,
    search,
  } = useSearchStore()

  // 从URL参数初始化搜索
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== keyword) {
      setKeyword(q)
      search(q)
    }
  }, [])

  // 处理搜索
  const handleSearch = (value: string) => {
    if (!value.trim()) return
    setSearchParams({ q: value.trim() })
    search(value.trim())
  }

  // 处理分页
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      useSearchStore.getState().setPageSize(newPageSize)
    } else {
      setPage(newPage)
    }
  }

  // 跳转到日记详情
  const handleItemClick = (date: string) => {
    navigate(`/history?date=${date}`)
  }

  // 格式化盈亏金额
  const formatProfitLoss = (amount?: number) => {
    if (amount === undefined || amount === null) return null
    const isProfit = amount >= 0
    return (
      <Text style={{ color: isProfit ? '#cf1322' : '#3f8600', fontWeight: 500 }}>
        {isProfit ? '+' : ''}{amount.toFixed(2)}
      </Text>
    )
  }

  // 获取字段标签
  const getFieldLabel = (field: string) => {
    return FIELD_LABELS[field] || field
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <Search
          placeholder="搜索日记内容..."
          allowClear
          enterButton={<><SearchOutlined /> 搜索</>}
          size="large"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          loading={loading}
        />
      </Card>

      <Spin spinning={loading}>
        {hasSearched ? (
          results.length > 0 ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                  共找到 {total} 条相关结果
                </Text>
              </div>
              <List
                itemLayout="vertical"
                dataSource={results}
                renderItem={(item) => (
                  <List.Item
                    key={`${item.id}-${item.field}`}
                    onClick={() => handleItemClick(item.date)}
                    style={{ cursor: 'pointer' }}
                    extra={formatProfitLoss(item.profitLossAmount)}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CalendarOutlined />
                          <span>{item.date}</span>
                          <Tag color="blue">{getFieldLabel(item.field)}</Tag>
                        </div>
                      }
                    />
                    <div
                      style={{
                        color: 'rgba(0, 0, 0, 0.65)',
                        lineHeight: 1.6,
                      }}
                      dangerouslySetInnerHTML={{ __html: item.highlight || item.content }}
                    />
                  </List.Item>
                )}
              />
              {total > pageSize && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(t) => `共 ${t} 条`}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty
              description="未找到相关内容"
              style={{ marginTop: 48 }}
            />
          )
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="输入关键词开始搜索"
            style={{ marginTop: 48 }}
          />
        )}
      </Spin>
    </div>
  )
}

export default SearchPage
