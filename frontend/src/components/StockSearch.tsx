import React, { useState, useMemo } from 'react'
import { AutoComplete, Input, Space, Typography, Spin } from 'antd'
import { SearchOutlined, StockOutlined } from '@ant-design/icons'
import { stockService, type StockSearchResult } from '@/services'

const { Text } = Typography

interface StockSearchProps {
  placeholder?: string
  style?: React.CSSProperties
  onSelect?: (stock: StockSearchResult) => void
  onChange?: (code: string, name: string) => void
  value?: string
  disabled?: boolean
}

const StockSearch: React.FC<StockSearchProps> = ({
  placeholder = '搜索股票代码或名称',
  style,
  onSelect,
  onChange,
  value,
  disabled,
}) => {
  const [options, setOptions] = useState<{ value: string; label: React.ReactNode; stock: StockSearchResult }[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')

  // 简单的防抖实现
  const searchStocks = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    return (keyword: string) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        if (!keyword || keyword.length < 1) {
          setOptions([])
          return
        }
        setLoading(true)
        try {
          const res = await stockService.searchStock(keyword)
          const stocks = res.data.data || []
          setOptions(
            stocks.map((stock) => ({
              value: `${stock.code} - ${stock.name}`,
              label: (
                <Space>
                  <StockOutlined />
                  <Text strong>{stock.code}</Text>
                  <Text>{stock.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {stock.market}
                  </Text>
                </Space>
              ),
              stock,
            }))
          )
        } catch (error) {
          console.error('搜索股票失败:', error)
          setOptions([])
        } finally {
          setLoading(false)
        }
      }, 300)
    }
  }, [])

  const handleSearch = (searchValue: string) => {
    setInputValue(searchValue)
    searchStocks(searchValue)
  }

  const handleSelect = (_: string, option: any) => {
    const stock = option.stock as StockSearchResult
    setInputValue(`${stock.code} - ${stock.name}`)
    onSelect?.(stock)
    onChange?.(stock.code, stock.name)
  }

  const handleChange = (value: string) => {
    setInputValue(value)
  }

  return (
    <AutoComplete
      value={inputValue}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onChange={handleChange}
      style={{ width: '100%', ...style }}
      disabled={disabled}
    >
      <Input
        placeholder={placeholder}
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        suffix={loading ? <Spin size="small" /> : null}
        allowClear
      />
    </AutoComplete>
  )
}

export default StockSearch
