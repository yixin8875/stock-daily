import React from 'react'
import { Card, Radio, Select, Input, Space } from 'antd'
import type { MarketTrend, VolumeType } from '@/types/diary'
import { HOT_SECTORS } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

const { TextArea } = Input

const trendOptions = [
  { label: '大涨', value: 'big_rise' },
  { label: '小涨', value: 'small_rise' },
  { label: '平盘', value: 'flat' },
  { label: '小跌', value: 'small_fall' },
  { label: '大跌', value: 'big_fall' },
]

const volumeOptions = [
  { label: '放量', value: 'high' },
  { label: '缩量', value: 'low' },
  { label: '平量', value: 'normal' },
]

const MarketCommentCard: React.FC = () => {
  const { marketComment, setMarketComment } = useDiaryStore()

  return (
    <Card title="大盘点评" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>大盘走势</div>
          <Radio.Group
            options={trendOptions}
            value={marketComment.trend}
            onChange={(e) => setMarketComment({ trend: e.target.value as MarketTrend })}
            optionType="button"
            buttonStyle="solid"
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>成交量</div>
          <Radio.Group
            options={volumeOptions}
            value={marketComment.volume}
            onChange={(e) => setMarketComment({ volume: e.target.value as VolumeType })}
            optionType="button"
            buttonStyle="solid"
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>热点板块</div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="选择热点板块"
            value={marketComment.hotSectors}
            onChange={(value) => setMarketComment({ hotSectors: value })}
            options={HOT_SECTORS.map((sector) => ({ label: sector, value: sector }))}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>点评内容</div>
          <TextArea
            rows={4}
            placeholder="记录今日大盘走势分析..."
            value={marketComment.comment}
            onChange={(e) => setMarketComment({ comment: e.target.value })}
          />
        </div>
      </Space>
    </Card>
  )
}

export default MarketCommentCard
