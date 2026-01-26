import React from 'react'
import { Input, Select, Collapse, Row, Col } from 'antd'
import type { EmotionLevel } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

const { TextArea } = Input

const emotionOptions = [
  { label: '非常积极', value: 'very_positive' },
  { label: '积极', value: 'positive' },
  { label: '平静', value: 'neutral' },
  { label: '消极', value: 'negative' },
  { label: '非常消极', value: 'very_negative' },
]

const EmotionCard: React.FC = () => {
  const { emotion, setEmotion } = useDiaryStore()

  return (
    <Collapse
      defaultActiveKey={[]}
      style={{ marginBottom: 16 }}
      items={[
        {
          key: '1',
          label: '情绪记录',
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>开盘前情绪</div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="选择情绪"
                    value={emotion.beforeOpen}
                    onChange={(v) => setEmotion({ beforeOpen: v as EmotionLevel })}
                    options={emotionOptions}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>盘中情绪</div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="选择情绪"
                    value={emotion.duringTrading}
                    onChange={(v) => setEmotion({ duringTrading: v as EmotionLevel })}
                    options={emotionOptions}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>收盘后情绪</div>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="选择情绪"
                    value={emotion.afterClose}
                    onChange={(v) => setEmotion({ afterClose: v as EmotionLevel })}
                    options={emotionOptions}
                    allowClear
                  />
                </Col>
              </Row>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>情绪备注</div>
                <TextArea
                  rows={3}
                  placeholder="记录今天的情绪变化..."
                  value={emotion.note}
                  onChange={(e) => setEmotion({ note: e.target.value })}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}

export default EmotionCard
