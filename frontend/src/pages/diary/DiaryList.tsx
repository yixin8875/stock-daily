import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Modal,
  message,
  Card,
  Empty,
  Tag,
  List,
  Dropdown,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { MenuProps } from 'antd'
import dayjs from 'dayjs'
import { diaryService } from '@/services/diary'
import { useDiaryStore } from '@/stores/diaryStore'
import { useResponsive } from '@/hooks'
import type { TodaySummary, MarketTrend } from '@/types/diary'

const { Title } = Typography
const { RangePicker } = DatePicker

// 大盘走势映射
const MARKET_TREND_MAP: Record<MarketTrend, { label: string; color: string }> = {
  big_rise: { label: '大涨', color: '#cf1322' },
  small_rise: { label: '小涨', color: '#fa541c' },
  flat: { label: '平盘', color: '#8c8c8c' },
  small_fall: { label: '小跌', color: '#52c41a' },
  big_fall: { label: '大跌', color: '#389e0d' },
}

// 盈亏状态筛选选项
const PROFIT_STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '盈利', value: 'profit' },
  { label: '亏损', value: 'loss' },
]

interface DiaryListItem {
  id: string | number
  date: string
  marketTrend: MarketTrend | null
  profitLossAmount: number | null
  profitLossPercent: number | null
  tradeCount: number
}

const DiaryList: React.FC = () => {
  const navigate = useNavigate()
  const { setSelectedDate } = useDiaryStore()
  const { isMobile } = useResponsive()

  // 列表数据状态
  const [loading, setLoading] = useState(false)
  const [diaryList, setDiaryList] = useState<DiaryListItem[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 筛选条件状态
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])
  const [profitStatus, setProfitStatus] = useState<string>('all')

  // 获取日记列表
  const fetchDiaryList = useCallback(async (
    page: number = 1,
    pageSize: number = 10,
    startDate?: string,
    endDate?: string
  ) => {
    setLoading(true)
    try {
      const response = await diaryService.getDiaryList({
        page,
        pageSize,
        startDate,
        endDate,
      })

      // 处理返回数据，兼容空数据情况
      const responseData = response.data?.data || response.data
      const data = responseData?.data || []
      const paginationData = responseData?.pagination || { page: 1, limit: pageSize, total: 0 }

      // 转换数据格式
      const listItems: DiaryListItem[] = (Array.isArray(data) ? data : []).map((item: TodaySummary & {
        marketTrend?: MarketTrend | null
        profitLossAmount?: number | null
        profitLossPercent?: number | null
        trades?: unknown[]
      }) => ({
        id: item.id || '',
        date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
        marketTrend: item.marketTrend || item.marketComment?.trend || null,
        profitLossAmount: item.profitLossAmount ?? item.profitLoss?.todayProfit ?? null,
        profitLossPercent: item.profitLossPercent ?? item.profitLoss?.todayProfitRate ?? null,
        tradeCount: item.trades?.length || item.tradeRecords?.length || 0,
      }))

      setDiaryList(listItems)
      setPagination({
        current: paginationData.page || 1,
        pageSize: paginationData.limit || pageSize,
        total: paginationData.total || 0,
      })
    } catch (error) {
      // 静默处理错误，不显示错误提示
      console.error('Failed to fetch diary list:', error)
      setDiaryList([])
      setPagination({ current: 1, pageSize: 10, total: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    fetchDiaryList()
  }, [fetchDiaryList])

  // 处理搜索
  const handleSearch = () => {
    const startDate = dateRange[0]?.format('YYYY-MM-DD')
    const endDate = dateRange[1]?.format('YYYY-MM-DD')
    fetchDiaryList(1, pagination.pageSize, startDate, endDate)
  }

  // 处理分页变化
  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    const startDate = dateRange[0]?.format('YYYY-MM-DD')
    const endDate = dateRange[1]?.format('YYYY-MM-DD')
    fetchDiaryList(
      paginationConfig.current || 1,
      paginationConfig.pageSize || 10,
      startDate,
      endDate
    )
  }

  // 跳转到今日总结页面（查看）
  const handleView = (date: string) => {
    setSelectedDate(date)
    navigate('/diary/today')
  }

  // 跳转到今日总结页面（编辑）
  const handleEdit = (date: string) => {
    setSelectedDate(date)
    navigate('/diary/today')
  }

  // 删除日记
  const handleDelete = (id: string | number, date: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${date} 的交易日记吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await diaryService.deleteDiary(id)
          message.success('删除成功')
          // 重新加载列表
          const startDate = dateRange[0]?.format('YYYY-MM-DD')
          const endDate = dateRange[1]?.format('YYYY-MM-DD')
          fetchDiaryList(pagination.current, pagination.pageSize, startDate, endDate)
        } catch (error) {
          console.error('Failed to delete diary:', error)
          message.error('删除失败')
        }
      },
    })
  }

  // 跳转到写今日总结
  const handleWriteToday = () => {
    setSelectedDate(dayjs().format('YYYY-MM-DD'))
    navigate('/diary/today')
  }

  // 根据盈亏状态筛选数据
  const filteredList = diaryList.filter((item) => {
    if (profitStatus === 'all') return true
    if (profitStatus === 'profit') return (item.profitLossAmount ?? 0) > 0
    if (profitStatus === 'loss') return (item.profitLossAmount ?? 0) < 0
    return true
  })

  // 渲染盈亏金额
  const renderProfitAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) {
      return <span style={{ color: '#999' }}>-</span>
    }
    const color = amount > 0 ? '#cf1322' : amount < 0 ? '#389e0d' : '#8c8c8c'
    const prefix = amount > 0 ? '+' : ''
    return (
      <span style={{ color, fontWeight: 500 }}>
        {prefix}{amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    )
  }

  // 渲染盈亏比例
  const renderProfitPercent = (percent: number | null) => {
    if (percent === null || percent === undefined) {
      return <span style={{ color: '#999' }}>-</span>
    }
    const color = percent > 0 ? '#cf1322' : percent < 0 ? '#389e0d' : '#8c8c8c'
    const prefix = percent > 0 ? '+' : ''
    return (
      <span style={{ color, fontWeight: 500 }}>
        {prefix}{percent.toFixed(2)}%
      </span>
    )
  }

  // 移动端操作菜单
  const getActionMenuItems = (record: DiaryListItem): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: '查看',
      onClick: () => handleView(record.date),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: () => handleEdit(record.date),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDelete(record.id, record.date),
    },
  ]

  // 表格列定义
  const columns: ColumnsType<DiaryListItem> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '大盘走势',
      dataIndex: 'marketTrend',
      key: 'marketTrend',
      width: 100,
      render: (trend: MarketTrend | null) => {
        if (!trend) return <span style={{ color: '#999' }}>-</span>
        const trendInfo = MARKET_TREND_MAP[trend]
        return <Tag color={trendInfo.color}>{trendInfo.label}</Tag>
      },
    },
    {
      title: '盈亏金额',
      dataIndex: 'profitLossAmount',
      key: 'profitLossAmount',
      width: 120,
      align: 'right',
      render: renderProfitAmount,
    },
    {
      title: '盈亏比例',
      dataIndex: 'profitLossPercent',
      key: 'profitLossPercent',
      width: 100,
      align: 'right',
      render: renderProfitPercent,
    },
    {
      title: '交易笔数',
      dataIndex: 'tradeCount',
      key: 'tradeCount',
      width: 100,
      align: 'center',
      render: (count: number) => count || 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.date)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.date)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.date)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  // 移动端列表项渲染
  const renderMobileListItem = (item: DiaryListItem) => (
    <List.Item
      actions={[
        <Dropdown menu={{ items: getActionMenuItems(item) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>,
      ]}
    >
      <List.Item.Meta
        title={
          <Space>
            <span>{dayjs(item.date).format('YYYY-MM-DD')}</span>
            {item.marketTrend && (
              <Tag color={MARKET_TREND_MAP[item.marketTrend].color}>
                {MARKET_TREND_MAP[item.marketTrend].label}
              </Tag>
            )}
          </Space>
        }
        description={
          <Space split="·">
            <span>盈亏: {renderProfitAmount(item.profitLossAmount)}</span>
            <span>{renderProfitPercent(item.profitLossPercent)}</span>
            <span>{item.tradeCount}笔交易</span>
          </Space>
        }
      />
    </List.Item>
  )

  return (
    <div style={{ padding: 0 }}>
      {/* 页面标题和快捷入口 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? 16 : 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          交易日记
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleWriteToday}>
          {isMobile ? '记录' : '写今日总结'}
        </Button>
      </div>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: isMobile ? 12 : 24 }}>
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Space wrap>
            {!isMobile && <span>日期范围：</span>}
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
              }}
              allowClear
              format="YYYY-MM-DD"
              style={{ width: isMobile ? '100%' : 'auto' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Space>
          <Space>
            {!isMobile && <span>盈亏状态：</span>}
            <Select
              value={profitStatus}
              onChange={setProfitStatus}
              options={PROFIT_STATUS_OPTIONS}
              style={{ width: 100 }}
            />
          </Space>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            {isMobile ? '' : '搜索'}
          </Button>
        </Space>
      </Card>

      {/* 日记列表 */}
      <Card bodyStyle={{ padding: isMobile ? 0 : undefined }}>
        {isMobile ? (
          // 移动端使用 List 组件
          <List
            loading={loading}
            dataSource={filteredList}
            renderItem={renderMobileListItem}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                const startDate = dateRange[0]?.format('YYYY-MM-DD')
                const endDate = dateRange[1]?.format('YYYY-MM-DD')
                fetchDiaryList(page, pageSize, startDate, endDate)
              },
              size: 'small',
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无交易日记"
                >
                  <Button type="primary" onClick={handleWriteToday}>
                    立即记录
                  </Button>
                </Empty>
              ),
            }}
          />
        ) : (
          // 桌面端使用 Table 组件
          <Table<DiaryListItem>
            columns={columns}
            dataSource={filteredList}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              pageSizeOptions: ['10', '20', '50'],
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="暂无交易日记"
                >
                  <Button type="primary" onClick={handleWriteToday}>
                    立即记录
                  </Button>
                </Empty>
              ),
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  )
}

export default DiaryList
