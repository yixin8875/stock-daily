import React from 'react'
import { Modal, Descriptions, Tag, Typography, Divider, Empty, Space } from 'antd'
import type { TodaySummary, TomorrowPlan, MarketTrend, VolumeType, EmotionLevel } from '@/types/diary'

const { Text, Paragraph } = Typography

interface DiaryDetailModalProps {
  open: boolean
  onClose: () => void
  summary: TodaySummary | null
  plan: TomorrowPlan | null
  loading?: boolean
}

const TREND_MAP: Record<MarketTrend, { label: string; color: string }> = {
  big_rise: { label: '大涨', color: '#F5222D' },
  small_rise: { label: '小涨', color: '#FA8C16' },
  flat: { label: '平盘', color: '#8C8C8C' },
  small_fall: { label: '小跌', color: '#52C41A' },
  big_fall: { label: '大跌', color: '#389E0D' },
}

const VOLUME_MAP: Record<VolumeType, string> = { high: '放量', low: '缩量', normal: '平量' }

const EMOTION_MAP: Record<EmotionLevel, { label: string; color: string }> = {
  very_positive: { label: '非常积极', color: '#F5222D' },
  positive: { label: '积极', color: '#FA8C16' },
  neutral: { label: '平静', color: '#8C8C8C' },
  negative: { label: '消极', color: '#52C41A' },
  very_negative: { label: '非常消极', color: '#389E0D' },
}

const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({ open, onClose, summary, plan, loading }) => {
  if (!summary && !plan) {
    return (<Modal title="日记详情" open={open} onCancel={onClose} footer={null} width={800}><Empty description="暂无记录" /></Modal>)
  }

  const renderSummary = () => {
    if (!summary) return null
    return (
      <>
        <Divider>今日总结</Divider>
        <Descriptions title="大盘点评" column={2} bordered size="small">
          <Descriptions.Item label="大盘走势">
            {summary.marketComment.trend ? <Tag color={TREND_MAP[summary.marketComment.trend].color}>{TREND_MAP[summary.marketComment.trend].label}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="成交量">{summary.marketComment.volume ? VOLUME_MAP[summary.marketComment.volume] : '-'}</Descriptions.Item>
          <Descriptions.Item label="热点板块" span={2}>
            <Space wrap>{summary.marketComment.hotSectors.length > 0 ? summary.marketComment.hotSectors.map(s => <Tag key={s} color="blue">{s}</Tag>) : '-'}</Space>
          </Descriptions.Item>
          <Descriptions.Item label="点评" span={2}>{summary.marketComment.comment || '-'}</Descriptions.Item>
        </Descriptions>
        <Descriptions title="盈亏情况" column={3} bordered size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="今日盈亏">
            {summary.profitLoss.todayProfit !== null ? <Text style={{ color: summary.profitLoss.todayProfit >= 0 ? '#F5222D' : '#52C41A' }}>{summary.profitLoss.todayProfit >= 0 ? '+' : ''}{summary.profitLoss.todayProfit.toFixed(2)}</Text> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="盈亏比例">
            {summary.profitLoss.todayProfitRate !== null ? <Text style={{ color: summary.profitLoss.todayProfitRate >= 0 ? '#F5222D' : '#52C41A' }}>{summary.profitLoss.todayProfitRate >= 0 ? '+' : ''}{summary.profitLoss.todayProfitRate.toFixed(2)}%</Text> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="总资产">{summary.profitLoss.totalAssets?.toLocaleString() || '-'}</Descriptions.Item>
        </Descriptions>
        {summary.tradeRecords.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>交易记录 ({summary.tradeRecords.length}笔)</Text>
            <div style={{ marginTop: 8 }}>
              {summary.tradeRecords.map(r => (
                <div key={r.id} style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 4, marginBottom: 8 }}>
                  <Space>
                    <Tag color={r.direction === 'buy' ? '#F5222D' : '#52C41A'}>{r.direction === 'buy' ? '买入' : '卖出'}</Tag>
                    <Text strong>{r.stockName}</Text><Text type="secondary">({r.stockCode})</Text>
                    <Text>价格: {r.price}</Text><Text>数量: {r.quantity}</Text>
                  </Space>
                  {r.reason && <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>原因: {r.reason}</Paragraph>}
                </div>
              ))}
            </div>
          </div>
        )}
        <Descriptions title="操作反思" column={1} bordered size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="做对了什么">{summary.reflection.didRight || '-'}</Descriptions.Item>
          <Descriptions.Item label="做错了什么">{summary.reflection.didWrong || '-'}</Descriptions.Item>
          <Descriptions.Item label="改进计划">{summary.reflection.improvementPlan || '-'}</Descriptions.Item>
          <Descriptions.Item label="标签"><Space wrap>{summary.reflection.tags.length > 0 ? summary.reflection.tags.map(t => <Tag key={t}>{t}</Tag>) : '-'}</Space></Descriptions.Item>
        </Descriptions>
        <Descriptions title="情绪记录" column={3} bordered size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="开盘前">{summary.emotion.beforeOpen ? <Tag color={EMOTION_MAP[summary.emotion.beforeOpen].color}>{EMOTION_MAP[summary.emotion.beforeOpen].label}</Tag> : '-'}</Descriptions.Item>
          <Descriptions.Item label="交易中">{summary.emotion.duringTrading ? <Tag color={EMOTION_MAP[summary.emotion.duringTrading].color}>{EMOTION_MAP[summary.emotion.duringTrading].label}</Tag> : '-'}</Descriptions.Item>
          <Descriptions.Item label="收盘后">{summary.emotion.afterClose ? <Tag color={EMOTION_MAP[summary.emotion.afterClose].color}>{EMOTION_MAP[summary.emotion.afterClose].label}</Tag> : '-'}</Descriptions.Item>
          {summary.emotion.note && <Descriptions.Item label="备注" span={3}>{summary.emotion.note}</Descriptions.Item>}
        </Descriptions>
        {(summary.learningNote.content || summary.learningNote.category) && (
          <Descriptions title="学习笔记" column={1} bordered size="small" style={{ marginTop: 16 }}>
            {summary.learningNote.category && <Descriptions.Item label="分类"><Tag color="purple">{summary.learningNote.category}</Tag></Descriptions.Item>}
            {summary.learningNote.content && <Descriptions.Item label="内容">{summary.learningNote.content}</Descriptions.Item>}
          </Descriptions>
        )}
      </>
    )
  }

  const renderPlan = () => {
    if (!plan) return null
    return (
      <>
        <Divider>明日计划</Divider>
        {plan.watchStocks.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>关注股票 ({plan.watchStocks.length}只)</Text>
            <div style={{ marginTop: 8 }}>
              {plan.watchStocks.map(s => (
                <div key={s.id} style={{ padding: '8px 12px', background: '#fafafa', borderRadius: 4, marginBottom: 8 }}>
                  <Space><Text strong>{s.stockName}</Text><Text type="secondary">({s.stockCode})</Text>
                    <Tag color={s.level === 'high' ? 'red' : s.level === 'medium' ? 'orange' : 'default'}>{s.level === 'high' ? '重点关注' : s.level === 'medium' ? '一般关注' : '观察'}</Tag>
                  </Space>
                  {s.reason && <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>原因: {s.reason}</Paragraph>}
                </div>
              ))}
            </div>
          </div>
        )}
        {plan.buyPlans.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>买入计划 ({plan.buyPlans.length}个)</Text>
            <div style={{ marginTop: 8 }}>
              {plan.buyPlans.map(p => (
                <div key={p.id} style={{ padding: '8px 12px', background: '#fff1f0', borderRadius: 4, marginBottom: 8 }}>
                  <Space><Tag color="#F5222D">买入</Tag><Text strong>{p.stockName}</Text><Text type="secondary">({p.stockCode})</Text>
                    {p.targetPrice && <Text>目标价: {p.targetPrice}</Text>}{p.positionPercent && <Text>仓位: {p.positionPercent}%</Text>}
                  </Space>
                  {p.triggerCondition && <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>触发条件: {p.triggerCondition}</Paragraph>}
                </div>
              ))}
            </div>
          </div>
        )}
        {plan.sellPlans.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>卖出计划 ({plan.sellPlans.length}个)</Text>
            <div style={{ marginTop: 8 }}>
              {plan.sellPlans.map(p => (
                <div key={p.id} style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: 4, marginBottom: 8 }}>
                  <Space><Tag color="#52C41A">卖出</Tag><Text strong>{p.stockName}</Text><Text type="secondary">({p.stockCode})</Text>
                    {p.targetPrice && <Text>目标价: {p.targetPrice}</Text>}{p.sellPercent && <Text>卖出比例: {p.sellPercent}%</Text>}
                  </Space>
                  {p.triggerCondition && <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>触发条件: {p.triggerCondition}</Paragraph>}
                </div>
              ))}
            </div>
          </div>
        )}
        {plan.stopLosses.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>止损设置 ({plan.stopLosses.length}个)</Text>
            <div style={{ marginTop: 8 }}>
              {plan.stopLosses.map(l => (
                <div key={l.id} style={{ padding: '8px 12px', background: '#fffbe6', borderRadius: 4, marginBottom: 8 }}>
                  <Space><Tag color="warning">止损</Tag><Text strong>{l.stockName}</Text><Text type="secondary">({l.stockCode})</Text>
                    {l.stopPrice && <Text>止损价: {l.stopPrice}</Text>}{l.costPrice && <Text>成本价: {l.costPrice}</Text>}
                  </Space>
                  {l.reason && <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>原因: {l.reason}</Paragraph>}
                </div>
              ))}
            </div>
          </div>
        )}
        {(plan.riskAlert.riskTypes.length > 0 || plan.riskAlert.description) && (
          <Descriptions title="风险提示" column={1} bordered size="small">
            <Descriptions.Item label="风险类型">
              <Space wrap>{plan.riskAlert.riskTypes.map(t => <Tag key={t} color="error">{t === 'system' ? '系统风险' : t === 'stock' ? '个股风险' : t === 'position' ? '仓位风险' : '情绪风险'}</Tag>)}</Space>
            </Descriptions.Item>
            {plan.riskAlert.description && <Descriptions.Item label="风险描述">{plan.riskAlert.description}</Descriptions.Item>}
            {plan.riskAlert.countermeasures && <Descriptions.Item label="应对措施">{plan.riskAlert.countermeasures}</Descriptions.Item>}
          </Descriptions>
        )}
      </>
    )
  }

  return (
    <Modal title={`${summary?.date || plan?.date || ''} 日记详情`} open={open} onCancel={onClose} footer={null} width={800} loading={loading}>
      {renderSummary()}
      {renderPlan()}
    </Modal>
  )
}

export default DiaryDetailModal
