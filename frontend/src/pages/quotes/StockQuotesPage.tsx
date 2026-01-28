import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Typography,
  Tag,
  message,
  Empty,
  Spin,
  Modal,
  List,
  Switch,
  Statistic,
  Row,
  Col,
  Segmented,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  StockOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BellOutlined,
  LineChartOutlined,
} from '@ant-design/icons'
import { stockService, type StockQuote, type StockSearchResult, type KLineData } from '@/services'
import { KLineChart } from '@/components'
import { StockCompare } from './components'

const { Title, Text } = Typography

interface WatchedStock {
  code: string
  name: string
  targetPrice?: number
  alertEnabled: boolean
}

const STORAGE_KEY = 'stock_watchlist'

const StockQuotesPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchedStock[]>([])
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({})
  const [loading, setLoading] = useState(false)
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [klineModalVisible, setKlineModalVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<WatchedStock | null>(null)
  const [klineData, setKlineData] = useState<KLineData[]>([])
  const [klineLoading, setKlineLoading] = useState(false)
  const [klinePeriod, setKlinePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // 从 localStorage 加载自选股
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load watchlist:', e)
      }
    }
  }, [])

  // 保存自选股到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  // 获取行情
  const fetchQuotes = useCallback(async () => {
    if (watchlist.length === 0) return

    setLoading(true)
    try {
      const codes = watchlist.map(s => s.code)
      const res = await stockService.getQuotes(codes)
      const quotesMap: Record<string, StockQuote> = {}
      if (res.data.data) {
        res.data.data.forEach((q: StockQuote) => {
          quotesMap[q.code] = q

          // 检查是否触发价格提醒
          const watched = watchlist.find(w => w.code === q.code)
          if (watched?.alertEnabled && watched.targetPrice) {
            if (q.price <= watched.targetPrice) {
              sendNotification(q.name, `已到达目标价 ¥${watched.targetPrice}，当前价 ¥${q.price}`)
            }
          }
        })
      }
      setQuotes(quotesMap)
    } catch (error) {
      console.error('获取行情失败:', error)
    } finally {
      setLoading(false)
    }
  }, [watchlist])

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && watchlist.length > 0) {
      fetchQuotes()
      refreshIntervalRef.current = setInterval(fetchQuotes, 10000) // 10秒刷新一次
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, fetchQuotes, watchlist.length])

  // 发送浏览器通知
  const sendNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`股票提醒: ${title}`, { body, icon: '/favicon.ico' })
    }
  }

  // 请求通知权限
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        message.success('通知权限已开启')
      } else {
        message.warning('通知权限被拒绝')
      }
    } else {
      message.error('浏览器不支持通知功能')
    }
  }

  // 获取K线数据
  const fetchKlineData = async (code: string, period: 'daily' | 'weekly' | 'monthly') => {
    setKlineLoading(true)
    try {
      const res = await stockService.getKLineData(code, period)
      setKlineData(res.data.data || [])
    } catch (error) {
      message.error('获取K线数据失败')
    } finally {
      setKlineLoading(false)
    }
  }

  // 打开K线图
  const handleShowKline = (stock: WatchedStock) => {
    setSelectedStock(stock)
    setKlineModalVisible(true)
    fetchKlineData(stock.code, klinePeriod)
  }

  // 切换K线周期
  const handleKlinePeriodChange = (period: 'daily' | 'weekly' | 'monthly') => {
    setKlinePeriod(period)
    if (selectedStock) {
      fetchKlineData(selectedStock.code, period)
    }
  }

  // 搜索股票
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return

    setSearching(true)
    try {
      const res = await stockService.searchStock(searchKeyword)
      setSearchResults(res.data.data || [])
    } catch (error) {
      message.error('搜索失败')
    } finally {
      setSearching(false)
    }
  }

  // 添加自选股
  const handleAddStock = (stock: StockSearchResult) => {
    if (watchlist.some(s => s.code === stock.code)) {
      message.warning('该股票已在自选列表中')
      return
    }

    setWatchlist([...watchlist, {
      code: stock.code,
      name: stock.name,
      alertEnabled: false,
    }])
    message.success('添加成功')
    setSearchModalVisible(false)
    setSearchKeyword('')
    setSearchResults([])
  }

  // 删除自选股
  const handleRemoveStock = (code: string) => {
    setWatchlist(watchlist.filter(s => s.code !== code))
    message.success('删除成功')
  }

  // 设置目标价
  const handleSetTargetPrice = (code: string, price: number | undefined) => {
    setWatchlist(watchlist.map(s =>
      s.code === code ? { ...s, targetPrice: price } : s
    ))
  }

  // 切换提醒
  const handleToggleAlert = (code: string) => {
    setWatchlist(watchlist.map(s =>
      s.code === code ? { ...s, alertEnabled: !s.alertEnabled } : s
    ))
  }

  // 计算统计数据
  const stats = {
    total: watchlist.length,
    up: Object.values(quotes).filter(q => q.change > 0).length,
    down: Object.values(quotes).filter(q => q.change < 0).length,
    flat: Object.values(quotes).filter(q => q.change === 0).length,
  }

  const columns = [
    {
      title: '股票',
      key: 'stock',
      render: (_: any, record: WatchedStock) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: '最新价',
      key: 'price',
      render: (_: any, record: WatchedStock) => {
        const quote = quotes[record.code]
        if (!quote) return <Text type="secondary">--</Text>
        return (
          <Text strong style={{ color: quote.change >= 0 ? '#EF4444' : '#10B981' }}>
            ¥{quote.price.toFixed(2)}
          </Text>
        )
      },
    },
    {
      title: '涨跌幅',
      key: 'change',
      render: (_: any, record: WatchedStock) => {
        const quote = quotes[record.code]
        if (!quote) return <Text type="secondary">--</Text>
        const isUp = quote.change >= 0
        return (
          <Tag color={isUp ? 'red' : 'green'} style={{ margin: 0 }}>
            {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(quote.changePercent).toFixed(2)}%
          </Tag>
        )
      },
    },
    {
      title: '今开/最高/最低',
      key: 'ohlc',
      render: (_: any, record: WatchedStock) => {
        const quote = quotes[record.code]
        if (!quote) return <Text type="secondary">--</Text>
        return (
          <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
            <Text type="secondary">开: {quote.open.toFixed(2)}</Text>
            <Text type="secondary">高: {quote.high.toFixed(2)} / 低: {quote.low.toFixed(2)}</Text>
          </Space>
        )
      },
    },
    {
      title: '目标价',
      key: 'target',
      width: 120,
      render: (_: any, record: WatchedStock) => (
        <Input
          size="small"
          type="number"
          placeholder="设置目标价"
          value={record.targetPrice}
          onChange={(e) => handleSetTargetPrice(record.code, e.target.value ? parseFloat(e.target.value) : undefined)}
          style={{ width: 100 }}
        />
      ),
    },
    {
      title: '提醒',
      key: 'alert',
      width: 80,
      render: (_: any, record: WatchedStock) => (
        <Switch
          size="small"
          checked={record.alertEnabled}
          onChange={() => handleToggleAlert(record.code)}
          disabled={!record.targetPrice}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: WatchedStock) => (
        <Space>
          <Button
            type="text"
            icon={<LineChartOutlined />}
            onClick={() => handleShowKline(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveStock(record.code)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          <StockOutlined style={{ marginRight: 8 }} />
          股票行情
        </Title>
        <Space>
          <Button
            icon={<BellOutlined />}
            onClick={requestNotificationPermission}
          >
            开启通知
          </Button>
          <span>
            自动刷新
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              style={{ marginLeft: 8 }}
            />
          </span>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchQuotes}
            loading={loading}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setSearchModalVisible(true)}
          >
            添加自选
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="自选股数" value={stats.total} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="上涨" value={stats.up} valueStyle={{ color: '#EF4444' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="下跌" value={stats.down} valueStyle={{ color: '#10B981' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="平盘" value={stats.flat} />
          </Card>
        </Col>
      </Row>

      {/* 自选股列表 */}
      <Card>
        {watchlist.length > 0 ? (
          <Table
            columns={columns}
            dataSource={watchlist}
            rowKey="code"
            loading={loading}
            pagination={false}
            size="middle"
          />
        ) : (
          <Empty description="暂无自选股，点击右上角添加">
            <Button type="primary" onClick={() => setSearchModalVisible(true)}>
              添加自选股
            </Button>
          </Empty>
        )}
      </Card>

      {/* 搜索弹窗 */}
      <Modal
        title="搜索股票"
        open={searchModalVisible}
        onCancel={() => {
          setSearchModalVisible(false)
          setSearchKeyword('')
          setSearchResults([])
        }}
        footer={null}
        width={500}
      >
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="输入股票代码或名称"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={searching}>
            搜索
          </Button>
        </Space.Compact>

        <Spin spinning={searching}>
          {searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => handleAddStock(item)}
                      disabled={watchlist.some(s => s.code === item.code)}
                    >
                      {watchlist.some(s => s.code === item.code) ? '已添加' : '添加'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`${item.code} · ${item.market === 'SH' ? '上海' : '深圳'}`}
                  />
                </List.Item>
              )}
            />
          ) : searchKeyword && !searching ? (
            <Empty description="未找到相关股票" />
          ) : null}
        </Spin>
      </Modal>

      {/* K线图弹窗 */}
      <Modal
        title={selectedStock ? `${selectedStock.name} (${selectedStock.code}) K线图` : 'K线图'}
        open={klineModalVisible}
        onCancel={() => {
          setKlineModalVisible(false)
          setSelectedStock(null)
          setKlineData([])
        }}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 16 }}>
          <Segmented
            value={klinePeriod}
            onChange={(value) => handleKlinePeriodChange(value as 'daily' | 'weekly' | 'monthly')}
            options={[
              { label: '日K', value: 'daily' },
              { label: '周K', value: 'weekly' },
              { label: '月K', value: 'monthly' },
            ]}
          />
        </div>
        <Spin spinning={klineLoading}>
          {klineData.length > 0 ? (
            <KLineChart data={klineData} height={500} />
          ) : (
            <Empty description="暂无K线数据" />
          )}
        </Spin>
      </Modal>

      {/* 股票对比分析 */}
      <StockCompare />
    </div>
  )
}

export default StockQuotesPage
