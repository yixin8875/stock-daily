import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, Space, message } from 'antd'
import { SettingOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import GridLayout, { type Layout, type LayoutItem } from 'react-grid-layout'
import TodayReminders from '@/components/TodayReminders'
import RecentTrades from '@/components/RecentTrades'
import QuickStats from '@/components/QuickStats'

// react-grid-layout 样式
const gridLayoutStyles = `
.react-grid-layout {
  position: relative;
  transition: height 200ms ease;
}
.react-grid-item {
  transition: all 200ms ease;
  transition-property: left, top;
}
.react-grid-item.cssTransforms {
  transition-property: transform;
}
.react-grid-item.resizing {
  z-index: 1;
  will-change: width, height;
}
.react-grid-item.react-draggable-dragging {
  transition: none;
  z-index: 3;
  will-change: transform;
}
.react-grid-item.dropping {
  visibility: hidden;
}
.react-grid-item > .react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
}
.react-grid-item > .react-resizable-handle::after {
  content: "";
  position: absolute;
  right: 3px;
  bottom: 3px;
  width: 5px;
  height: 5px;
  border-right: 2px solid rgba(0, 0, 0, 0.4);
  border-bottom: 2px solid rgba(0, 0, 0, 0.4);
}
.react-resizable-hide > .react-resizable-handle {
  display: none;
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-sw {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
  transform: rotate(90deg);
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-se {
  bottom: 0;
  right: 0;
  cursor: se-resize;
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-nw {
  top: 0;
  left: 0;
  cursor: nw-resize;
  transform: rotate(180deg);
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-ne {
  top: 0;
  right: 0;
  cursor: ne-resize;
  transform: rotate(270deg);
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-w,
.react-grid-item > .react-resizable-handle.react-resizable-handle-e {
  top: 50%;
  margin-top: -10px;
  cursor: ew-resize;
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-w {
  left: 0;
  transform: rotate(135deg);
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-e {
  right: 0;
  transform: rotate(315deg);
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-n,
.react-grid-item > .react-resizable-handle.react-resizable-handle-s {
  left: 50%;
  margin-left: -10px;
  cursor: ns-resize;
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-n {
  top: 0;
  transform: rotate(225deg);
}
.react-grid-item > .react-resizable-handle.react-resizable-handle-s {
  bottom: 0;
  transform: rotate(45deg);
}
.react-grid-placeholder {
  background: #3B82F6;
  opacity: 0.2;
  transition-duration: 100ms;
  z-index: 2;
  border-radius: 8px;
}
`

const { Title } = Typography

const STORAGE_KEY = 'dashboard_layout'

const defaultLayout: LayoutItem[] = [
  { i: 'stats', x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
  { i: 'reminders', x: 0, y: 3, w: 6, h: 8, minW: 4, minH: 4 },
  { i: 'trades', x: 6, y: 3, w: 6, h: 8, minW: 4, minH: 4 },
]

const widgetComponents: Record<string, { title: string; component: React.ReactNode }> = {
  stats: { title: '快速统计', component: <QuickStats /> },
  reminders: { title: '今日提醒', component: <TodayReminders /> },
  trades: { title: '最近交易', component: <RecentTrades /> },
}

const CustomDashboard: React.FC = () => {
  const [layout, setLayout] = useState<LayoutItem[]>(defaultLayout)
  const [isEditing, setIsEditing] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)

  useEffect(() => {
    // 加载保存的布局
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setLayout(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load layout:', e)
      }
    }

    // 监听容器宽度
    const updateWidth = () => {
      const container = document.getElementById('dashboard-container')
      if (container) {
        setContainerWidth(container.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const handleLayoutChange = (newLayout: Layout) => {
    const updatedLayout = [...newLayout].map(item => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW,
      minH: item.minH,
    }))
    setLayout(updatedLayout)
  }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
    message.success('布局已保存')
    setIsEditing(false)
  }

  const handleReset = () => {
    setLayout(defaultLayout)
    localStorage.removeItem(STORAGE_KEY)
    message.success('布局已重置')
  }

  return (
    <div id="dashboard-container" style={{ padding: '0 0 24px 0' }}>
      <style>{gridLayoutStyles}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>自定义仪表盘</Title>
        <Space>
          {isEditing ? (
            <>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                保存
              </Button>
            </>
          ) : (
            <Button icon={<SettingOutlined />} onClick={() => setIsEditing(true)}>
              编辑布局
            </Button>
          )}
        </Space>
      </div>

      <GridLayout
        className="layout"
        layout={layout}
        gridConfig={{ cols: 12, rowHeight: 50, margin: [10, 10] }}
        width={containerWidth}
        onLayoutChange={handleLayoutChange}
        dragConfig={{ enabled: isEditing, handle: '.drag-handle' }}
        resizeConfig={{ enabled: isEditing }}
      >
        {layout.map((item) => {
          const widget = widgetComponents[item.i]
          if (!widget) return null

          return (
            <div key={item.i} style={{ overflow: 'hidden' }}>
              <Card
                title={
                  <span className={isEditing ? 'drag-handle' : ''} style={{ cursor: isEditing ? 'move' : 'default' }}>
                    {widget.title}
                  </span>
                }
                style={{ height: '100%', overflow: 'auto' }}
                styles={{ body: { height: 'calc(100% - 57px)', overflow: 'auto' } }}
                bordered={isEditing}
              >
                {widget.component}
              </Card>
            </div>
          )
        })}
      </GridLayout>

      {isEditing && (
        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Typography.Text type="secondary">
            提示：拖拽卡片标题可以移动位置，拖拽卡片边缘可以调整大小
          </Typography.Text>
        </div>
      )}
    </div>
  )
}

export default CustomDashboard
