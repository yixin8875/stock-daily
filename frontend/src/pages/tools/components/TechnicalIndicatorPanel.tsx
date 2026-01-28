import React, { useState } from 'react'
import { Card, Input, Button, Descriptions, Spin, Empty, Space, Tag } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { stockService, type TechnicalIndicators } from '@/services'

const TechnicalIndicatorPanel: React.FC = () => {
  const [code, setCode] = useState('')
  const [data, setData] = useState<TechnicalIndicators | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await stockService.getTechnicalIndicators(code.trim())
      setData(res.data.data || null)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const getSignalTag = (type: string, value: number) => {
    let signal = ''
    let color = ''

    if (type === 'macd') {
      signal = value > 0 ? '多头' : '空头'
      color = value > 0 ? 'red' : 'green'
    } else if (type === 'kdj') {
      if (value > 80) { signal = '超买'; color = 'orange' }
      else if (value < 20) { signal = '超卖'; color = 'blue' }
      else { signal = '中性'; color = 'default' }
    } else if (type === 'rsi') {
      if (value > 70) { signal = '超买'; color = 'orange' }
      else if (value < 30) { signal = '超卖'; color = 'blue' }
      else { signal = '中性'; color = 'default' }
    }
    return <Tag color={color}>{signal}</Tag>
  }

  return (
    <Card title="技术指标计算器">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="输入股票代码"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 200 }}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          查询
        </Button>
      </Space>

      <Spin spinning={loading}>
        {!data ? (
          <Empty description="请输入股票代码查询" />
        ) : (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="MACD-DIF">{data.macd.dif.toFixed(3)}</Descriptions.Item>
            <Descriptions.Item label="MACD-DEA">{data.macd.dea.toFixed(3)}</Descriptions.Item>
            <Descriptions.Item label="MACD柱">{data.macd.macd.toFixed(3)} {getSignalTag('macd', data.macd.macd)}</Descriptions.Item>
            <Descriptions.Item label="KDJ-K">{data.kdj.k.toFixed(2)} {getSignalTag('kdj', data.kdj.k)}</Descriptions.Item>
            <Descriptions.Item label="KDJ-D">{data.kdj.d.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="KDJ-J">{data.kdj.j.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="RSI6">{data.rsi.rsi6.toFixed(2)} {getSignalTag('rsi', data.rsi.rsi6)}</Descriptions.Item>
            <Descriptions.Item label="RSI12">{data.rsi.rsi12.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="RSI24">{data.rsi.rsi24.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="MA5">{data.ma.ma5.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="MA10">{data.ma.ma10.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="MA20">{data.ma.ma20.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="MA60">{data.ma.ma60.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="BOLL上轨">{data.boll.upper.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="BOLL中轨">{data.boll.middle.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="BOLL下轨">{data.boll.lower.toFixed(2)}</Descriptions.Item>
          </Descriptions>
        )}
      </Spin>
    </Card>
  )
}

export default TechnicalIndicatorPanel
