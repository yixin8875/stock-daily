import React from 'react'
import { Input, Collapse } from 'antd'
import { useDiaryStore } from '@/stores/diaryStore'
import { TagSelect } from '@/components'

const { TextArea } = Input

const ReflectionCard: React.FC = () => {
  const { reflection, setReflection } = useDiaryStore()

  return (
    <Collapse
      defaultActiveKey={[]}
      style={{ marginBottom: 16 }}
      items={[
        {
          key: '1',
          label: '操作反思',
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>做对了什么</div>
                <TextArea
                  rows={3}
                  placeholder="记录今天做对的操作..."
                  value={reflection.didRight}
                  onChange={(e) => setReflection({ didRight: e.target.value })}
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>做错了什么</div>
                <TextArea
                  rows={3}
                  placeholder="记录今天做错的操作..."
                  value={reflection.didWrong}
                  onChange={(e) => setReflection({ didWrong: e.target.value })}
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>改进计划</div>
                <TextArea
                  rows={3}
                  placeholder="记录改进计划..."
                  value={reflection.improvementPlan}
                  onChange={(e) => setReflection({ improvementPlan: e.target.value })}
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>反思标签</div>
                <TagSelect
                  mode="multiple"
                  category="reflection"
                  placeholder="选择反思标签"
                  value={reflection.tags as unknown as number[]}
                  onChange={(value) => setReflection({ tags: value as unknown as string[] })}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}

export default ReflectionCard
