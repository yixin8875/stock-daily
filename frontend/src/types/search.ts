// 搜索结果项
export interface SearchResultItem {
  id: string
  date: string
  type: 'diary' | 'plan'
  field: string
  content: string
  highlight: string
  profitLossAmount?: number
}

// 搜索结果分页数据
export interface SearchResultData {
  list: SearchResultItem[]
  total: number
  page: number
  pageSize: number
}

// 搜索请求参数
export interface SearchParams {
  q: string
  page?: number
  pageSize?: number
}

// 字段类型映射
export const FIELD_LABELS: Record<string, string> = {
  marketComment: '大盘点评',
  reflection: '操作反思',
  learningNote: '学习笔记',
  emotion: '情绪记录',
  watchStock: '关注股票',
  buyPlan: '买入计划',
  sellPlan: '卖出计划',
  stopLoss: '止损计划',
  riskAlert: '风险提示',
  tradeRecord: '交易记录',
}
