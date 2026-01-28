import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Tabs, Space, Typography, Row, Col, Statistic, message } from 'antd'
import { FireOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons'
import { stockService, type DragonTigerItem, type InstitutionTrade } from '@/services'

const { Text } = Typography

const DragonTigerBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [listData, setListData] = useState<DragonTigerItem[]>([])
  const [institutionData, setInstitutionData] = useState<InstitutionTrade[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [listRes, institutionRes] = await Promise.all([
        stockService.getDragonTiger(),
        stockService.getInstitutionTrades(),
      ])
      setListData(listRes.data.data || [])
      setInstitutionData(institutionRes.data.data || [])
    } catch {
      message.error('获取龙虎榜数据失败')
    } finally {
      setLoading(false)
    }
  }

  const listColumns = [
    { title: '代码', dataIndex: 'code', width: 80 },
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, record: DragonTigerItem) => (
        <Space>
          <Text strong>{name}</Text>
          {Math.abs(record.change) > 7 && <FireOutlined style={{ color: '#F59E0B' }} />}
        </Space>
      ),
    },
    {
      title: '涨跌幅',
      dataIndex: 'change',
      render: (val: number) => (
        <Tag color={val >= 0 ? 'red' : 'green'}>
          {val >= 0 ? '+' : ''}{val.toFixed(2)}%
        </Tag>
      ),
    },
    { title: '上榜原因', dataIndex: 'reason', ellipsis: true },
    {
      title: '买入(亿)',
      dataIndex: 'buyAmount',
      render: (val: number) => <Text style={{ color: '#EF4444' }}>{val.toFixed(2)}</Text>,
    },
    {
      title: '卖出(亿)',
      dataIndex: 'sellAmount',
      render: (val: number) => <Text style={{ color: '#10B981' }}>{val.toFixed(2)}</Text>,
    },
    {
      title: '净额(亿)',
      dataIndex: 'netAmount',
      render: (val: number) => (
        <Text strong style={{ color: val >= 0 ? '#EF4444' : '#10B981' }}>
          {val >= 0 ? '+' : ''}{val.toFixed(2)}
        </Text>
      ),
    },
  ]

  const institutionColumns = [
    { title: '代码', dataIndex: 'code', width: 80 },
    { title: '名称', dataIndex: 'name' },
    {
      title: '方向',
      dataIndex: 'direction',
      render: (dir: string) => (
        <Tag color={dir === 'buy' ? 'red' : 'green'} icon={dir === 'buy' ? <RiseOutlined /> : <FallOutlined />}>
          {dir === 'buy' ? '买入' : '卖出'}
        </Tag>
      ),
    },
    {
      title: '金额(亿)',
      dataIndex: 'amount',
      render: (val: number) => val.toFixed(2),
    },
    { title: '席位数', dataIndex: 'seats' },
  ]

  const stats = {
    total: listData.length,
    netBuy: listData.filter(d => d.netAmount > 0).length,
    netSell: listData.filter(d => d.netAmount < 0).length,
    totalNetAmount: listData.reduce((sum, d) => sum + d.netAmount, 0),
  }

  return (
    <Card title="龙虎榜数据">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic title="上榜股票" value={stats.total} suffix="只" />
        </Col>
        <Col span={6}>
          <Statistic title="净买入" value={stats.netBuy} suffix="只" valueStyle={{ color: '#EF4444' }} />
        </Col>
        <Col span={6}>
          <Statistic title="净卖出" value={stats.netSell} suffix="只" valueStyle={{ color: '#10B981' }} />
        </Col>
        <Col span={6}>
          <Statistic
            title="总净额"
            value={stats.totalNetAmount}
            precision={2}
            suffix="亿"
            valueStyle={{ color: stats.totalNetAmount >= 0 ? '#EF4444' : '#10B981' }}
          />
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'list',
          label: '龙虎榜列表',
          children: <Table columns={listColumns} dataSource={listData} rowKey="code" loading={loading} pagination={false} size="small" />,
        },
        {
          key: 'institution',
          label: '机构动向',
          children: <Table columns={institutionColumns} dataSource={institutionData} rowKey="code" loading={loading} pagination={false} size="small" />,
        },
      ]} />
    </Card>
  )
}

export default DragonTigerBoard
