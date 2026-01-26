import React from 'react'
import { Input, Select, Collapse } from 'antd'
import { KNOWLEDGE_CATEGORIES } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

const { TextArea } = Input

const LearningNoteCard: React.FC = () => {
  const { learningNote, setLearningNote } = useDiaryStore()

  return (
    <Collapse
      defaultActiveKey={[]}
      style={{ marginBottom: 16 }}
      items={[
        {
          key: '1',
          label: '学习笔记',
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>知识分类</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="选择知识分类"
                  value={learningNote.category || undefined}
                  onChange={(v) => setLearningNote({ category: v })}
                  options={KNOWLEDGE_CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
                  allowClear
                />
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>笔记内容</div>
                <TextArea
                  rows={4}
                  placeholder="记录今天学到的知识..."
                  value={learningNote.content}
                  onChange={(e) => setLearningNote({ content: e.target.value })}
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  )
}

export default LearningNoteCard
