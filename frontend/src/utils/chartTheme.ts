// ECharts 主题配置 - 与应用主题保持一致

export const chartColors = {
  // 主色调
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  secondary: '#6366F1',

  // 盈亏颜色
  profit: '#10B981',
  profitLight: '#34D399',
  loss: '#EF4444',
  lossLight: '#F87171',

  // 中性色
  warning: '#F59E0B',
  info: '#6366F1',

  // 图表系列颜色
  series: [
    '#3B82F6', // 蓝
    '#10B981', // 绿
    '#F59E0B', // 橙
    '#8B5CF6', // 紫
    '#EC4899', // 粉
    '#06B6D4', // 青
    '#EF4444', // 红
    '#84CC16', // 黄绿
  ],
}

// 浅色主题
export const lightTheme = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#64748B',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  },
  title: {
    textStyle: {
      color: '#0F172A',
      fontWeight: 600,
    },
  },
  legend: {
    textStyle: {
      color: '#64748B',
    },
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    textStyle: {
      color: '#0F172A',
    },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: '#E2E8F0',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#E2E8F0',
      },
    },
    axisLabel: {
      color: '#64748B',
    },
    splitLine: {
      lineStyle: {
        color: '#F1F5F9',
      },
    },
  },
  yAxis: {
    axisLine: {
      lineStyle: {
        color: '#E2E8F0',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#E2E8F0',
      },
    },
    axisLabel: {
      color: '#64748B',
    },
    splitLine: {
      lineStyle: {
        color: '#F1F5F9',
      },
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true,
  },
}

// 深色主题
export const darkTheme = {
  backgroundColor: 'transparent',
  textStyle: {
    color: '#94A3B8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  },
  title: {
    textStyle: {
      color: '#F8FAFC',
      fontWeight: 600,
    },
  },
  legend: {
    textStyle: {
      color: '#94A3B8',
    },
  },
  tooltip: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    textStyle: {
      color: '#F8FAFC',
    },
    extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-radius: 8px;',
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: '#334155',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#334155',
      },
    },
    axisLabel: {
      color: '#94A3B8',
    },
    splitLine: {
      lineStyle: {
        color: '#1E293B',
      },
    },
  },
  yAxis: {
    axisLine: {
      lineStyle: {
        color: '#334155',
      },
    },
    axisTick: {
      lineStyle: {
        color: '#334155',
      },
    },
    axisLabel: {
      color: '#94A3B8',
    },
    splitLine: {
      lineStyle: {
        color: '#1E293B',
      },
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true,
  },
}

// 获取当前主题
export const getChartTheme = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme
}

// 获取盈亏颜色
export const getProfitLossColor = (value: number, mode: 'light' | 'dark' = 'light') => {
  if (value >= 0) {
    return mode === 'dark' ? chartColors.profitLight : chartColors.profit
  }
  return mode === 'dark' ? chartColors.lossLight : chartColors.loss
}

// 创建渐变色
export const createGradient = (color: string, opacity: [number, number] = [0.4, 0.05]) => ({
  type: 'linear',
  x: 0,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [
    { offset: 0, color: color + Math.round(opacity[0] * 255).toString(16).padStart(2, '0') },
    { offset: 1, color: color + Math.round(opacity[1] * 255).toString(16).padStart(2, '0') },
  ],
})
