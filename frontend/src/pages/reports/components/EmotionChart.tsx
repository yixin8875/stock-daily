import React, { useMemo } from 'react'
import { Card, Space, Empty } from 'antd'
import { SmileOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { EmotionStats } from '@/types/report'
import { useThemeStore } from '@/stores'
import { getChartTheme } from '@/utils/chartTheme'

interface EmotionChartProps {
  emotionStats: EmotionStats[]
}

const EMOTION_LABELS: Record<string, string> = {
  EXCITED: '兴奋',
  CALM: '平静',
  ANXIOUS: '焦虑',
  FEARFUL: '恐惧',
  GREEDY: '贪婪',
}

const EMOTION_COLORS: Record<string, string> = {
  EXCITED: '#10B981',
  CALM: '#6B7280',
  ANXIOUS: '#F59E0B',
  FEARFUL: '#EF4444',
  GREEDY: '#8B5CF6',
}

const EmotionChart: React.FC<EmotionChartProps> = ({ emotionStats }) => {
  const { mode } = useThemeStore()
  const chartTheme = getChartTheme(mode)

  const option = useMemo(() => {
    if (!emotionStats || emotionStats.length === 0) return null

    const data = emotionStats.map(stat => ({
      name: EMOTION_LABELS[stat.emotion] || stat.emotion,
      value: stat.count,
      itemStyle: { color: EMOTION_COLORS[stat.emotion] || '#6B7280' },
    }))

    return {
      ...chartTheme,
      tooltip: {
        ...chartTheme.tooltip,
        trigger: 'item',
        formatter: '{b}: {c} 次 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: mode === 'dark' ? '#94A3B8' : '#64748B',
        },
      },
      series: [
        {
          name: '情绪分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    }
  }, [emotionStats, mode, chartTheme])

  const dominantEmotion = emotionStats && emotionStats.length > 0 ? emotionStats[0] : null

  return (
    <Card
      title={
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SmileOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600 }}>情绪分析</span>
        </Space>
      }
      extra={
        dominantEmotion && (
          <span style={{ color: EMOTION_COLORS[dominantEmotion.emotion], fontWeight: 500 }}>
            主导情绪: {EMOTION_LABELS[dominantEmotion.emotion] || dominantEmotion.emotion}
          </span>
        )
      }
    >
      {option ? (
        <ReactECharts option={option} style={{ height: 280 }} />
      ) : (
        <Empty description="暂无情绪数据" style={{ padding: '40px 0' }} />
      )}
    </Card>
  )
}

export default EmotionChart
