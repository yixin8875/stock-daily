import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Progress, Spin, Empty } from 'antd'
import { PieChartOutlined } from '@ant-design/icons'
import { portfolioService, type IndustryAdvice } from '@/services'

const IndustryAdvicePanel: React.FC = () => {
  const [data, setData] = useState<IndustryAdvice[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await portfolioService.getIndustryAdvice()
      setData(res.data.data || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '行业', dataIndex: 'industry', key: 'industry' },
    {
      title: '当前配置', dataIndex: 'currentWeight', key: 'current',
      render: (v: number) => <Progress percent={v} size="small" style={{ width: 100 }} />
    },
    {
      title: '建议配置', dataIndex: 'suggestedWeight', key: 'suggested',
      render: (v: number) => <Progress percent={v} size="small" strokeColor="#1890FF" style={{ width: 100 }} />
    },
    {
      title: '操作建议', dataIndex: 'action', key: 'action',
      render: (v: string) => (
        <Tag color={v === 'increase' ? 'green' : v === 'decrease' ? 'red' : 'default'}>
          {v === 'increase' ? '增配' : v === 'decrease' ? '减配' : '持有'}
        </Tag>
      )
    },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
  ]

  return (
    <Card title={<><PieChartOutlined style={{ marginRight: 8 }} />行业配置建议</>}>
      <Spin spinning={loading}>
        {data.length > 0 ? (
          <Table columns={columns} dataSource={data} rowKey="industry" pagination={false} size="small" />
        ) : (
          <Empty description="暂无配置建议" />
        )}
      </Spin>
    </Card>
  )
}

export default IndustryAdvicePanel
