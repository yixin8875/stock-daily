// 错误码枚举
export enum ErrorCode {
  // 通用错误 1000-1999
  SUCCESS = 0,
  UNKNOWN_ERROR = 1000,
  VALIDATION_ERROR = 1001,
  NOT_FOUND = 1002,

  // 认证错误 2000-2999
  UNAUTHORIZED = 2000,
  TOKEN_EXPIRED = 2001,
  INVALID_TOKEN = 2002,

  // 业务错误 3000-3999
  STOCK_NOT_FOUND = 3000,
  DATA_FETCH_FAILED = 3001,
  RATE_LIMIT_EXCEEDED = 3002,
}

// 错误码对应的消息
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: '成功',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ErrorCode.VALIDATION_ERROR]: '参数验证失败',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.UNAUTHORIZED]: '未授权',
  [ErrorCode.TOKEN_EXPIRED]: 'Token已过期',
  [ErrorCode.INVALID_TOKEN]: '无效的Token',
  [ErrorCode.STOCK_NOT_FOUND]: '股票不存在',
  [ErrorCode.DATA_FETCH_FAILED]: '数据获取失败',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: '请求频率超限',
}
