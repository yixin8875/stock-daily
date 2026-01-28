import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { KLineData } from '@/services'

interface KLineChartProps {
  data: KLineData[]
  height?: number
  showMA?: boolean
  showMACD?: boolean
  showKDJ?: boolean
  showRSI?: boolean
  showBOLL?: boolean
  showVolume?: boolean
  maParams?: number[]
}

// 计算MA均线
const calculateMA = (data: KLineData[], period: number): (number | null)[] => {
  const result: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
    } else {
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close
      }
      result.push(Math.round(sum / period * 100) / 100)
    }
  }
  return result
}

// 计算MACD
const calculateMACD = (data: KLineData[]) => {
  const closes = data.map(d => d.close)
  const dif: number[] = []
  const dea: number[] = []
  const macd: number[] = []

  const calcEMA = (prices: number[], period: number): number[] => {
    const k = 2 / (period + 1)
    const ema: number[] = [prices[0]]
    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k))
    }
    return ema
  }

  const ema12 = calcEMA(closes, 12)
  const ema26 = calcEMA(closes, 26)

  for (let i = 0; i < closes.length; i++) {
    dif.push(Math.round((ema12[i] - ema26[i]) * 100) / 100)
  }

  const deaArr = calcEMA(dif, 9)
  for (let i = 0; i < closes.length; i++) {
    dea.push(Math.round(deaArr[i] * 100) / 100)
    macd.push(Math.round((dif[i] - dea[i]) * 2 * 100) / 100)
  }

  return { dif, dea, macd }
}

// 计算KDJ
const calculateKDJ = (data: KLineData[], n: number = 9) => {
  const k: number[] = []
  const d: number[] = []
  const j: number[] = []
  let prevK = 50, prevD = 50

  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      k.push(50); d.push(50); j.push(50)
      continue
    }
    const slice = data.slice(i - n + 1, i + 1)
    const low = Math.min(...slice.map(s => s.low))
    const high = Math.max(...slice.map(s => s.high))
    const rsv = high === low ? 50 : ((data[i].close - low) / (high - low)) * 100
    const newK = (2 / 3) * prevK + (1 / 3) * rsv
    const newD = (2 / 3) * prevD + (1 / 3) * newK
    k.push(Math.round(newK * 100) / 100)
    d.push(Math.round(newD * 100) / 100)
    j.push(Math.round((3 * newK - 2 * newD) * 100) / 100)
    prevK = newK; prevD = newD
  }
  return { k, d, j }
}

// 计算RSI
const calculateRSI = (data: KLineData[], period: number = 14) => {
  const rsi: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period) { rsi.push(null); continue }
    let gains = 0, losses = 0
    for (let j = i - period + 1; j <= i; j++) {
      const change = data[j].close - data[j - 1].close
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }
    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    rsi.push(Math.round((100 - 100 / (1 + rs)) * 100) / 100)
  }
  return rsi
}

// 计算布林带
const calculateBOLL = (data: KLineData[], n: number = 20, k: number = 2) => {
  const upper: (number | null)[] = []
  const mid: (number | null)[] = []
  const lower: (number | null)[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) { upper.push(null); mid.push(null); lower.push(null); continue }
    const slice = data.slice(i - n + 1, i + 1).map(d => d.close)
    const ma = slice.reduce((a, b) => a + b, 0) / n
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - ma, 2), 0) / n
    const std = Math.sqrt(variance)
    mid.push(Math.round(ma * 100) / 100)
    upper.push(Math.round((ma + k * std) * 100) / 100)
    lower.push(Math.round((ma - k * std) * 100) / 100)
  }
  return { upper, mid, lower }
}

const KLineChart: React.FC<KLineChartProps> = ({
  data,
  height = 500,
  showMA = true,
  showMACD = true,
  showKDJ = false,
  showRSI = false,
  showBOLL = false,
  showVolume = true,
  maParams = [5, 10, 20],
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    chartInstance.current = echarts.init(chartRef.current)
    return () => { chartInstance.current?.dispose() }
  }, [])

  useEffect(() => {
    if (!chartInstance.current || data.length === 0) return

    const dates = data.map(d => d.date)
    const klineData = data.map(d => [d.open, d.close, d.low, d.high])
    const volumes = data.map(d => d.volume)
    const maColors = ['#FF9800', '#2196F3', '#9C27B0']
    const maData = showMA ? maParams.map(p => calculateMA(data, p)) : []
    const macdData = showMACD ? calculateMACD(data) : null
    const bollData = showBOLL ? calculateBOLL(data) : null

    // 构建legend
    const legendData = ['K线']
    if (showMA) maParams.forEach(p => legendData.push(`MA${p}`))
    if (showBOLL) legendData.push('BOLL上轨', 'BOLL中轨', 'BOLL下轨')
    if (showVolume) legendData.push('成交量')
    if (showMACD) legendData.push('DIF', 'DEA', 'MACD')

    // 构建grid
    const grids: any[] = []
    const xAxisIndexes: number[] = []
    let currentTop: number | string = 60

    // 主图
    grids.push({ left: '8%', right: '8%', top: currentTop, height: showMACD ? '38%' : '50%' })
    xAxisIndexes.push(0)

    // 成交量图
    if (showVolume) {
      currentTop = showMACD ? '58%' : '68%'
      grids.push({ left: '8%', right: '8%', top: currentTop, height: '12%' })
      xAxisIndexes.push(1)
    }

    // MACD图
    if (showMACD) {
      grids.push({ left: '8%', right: '8%', top: '75%', height: '12%' })
      xAxisIndexes.push(showVolume ? 2 : 1)
    }

    // 构建series
    const series: any[] = [{
      name: 'K线',
      type: 'candlestick',
      data: klineData,
      itemStyle: {
        color: '#EF4444',
        color0: '#10B981',
        borderColor: '#EF4444',
        borderColor0: '#10B981',
      },
    }]

    // MA均线
    if (showMA) {
      maParams.forEach((p, i) => {
        series.push({
          name: `MA${p}`,
          type: 'line',
          data: maData[i],
          smooth: true,
          lineStyle: { width: 1 },
          symbol: 'none',
          itemStyle: { color: maColors[i % maColors.length] },
        })
      })
    }

    // 布林带
    if (showBOLL && bollData) {
      series.push(
        { name: 'BOLL上轨', type: 'line', data: bollData.upper, symbol: 'none', lineStyle: { width: 1, type: 'dashed' }, itemStyle: { color: '#E91E63' } },
        { name: 'BOLL中轨', type: 'line', data: bollData.mid, symbol: 'none', lineStyle: { width: 1 }, itemStyle: { color: '#9C27B0' } },
        { name: 'BOLL下轨', type: 'line', data: bollData.lower, symbol: 'none', lineStyle: { width: 1, type: 'dashed' }, itemStyle: { color: '#E91E63' } }
      )
    }

    // 成交量
    if (showVolume) {
      series.push({
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: (params: any) => {
            const idx = params.dataIndex
            return data[idx].close >= data[idx].open ? '#EF4444' : '#10B981'
          },
        },
      })
    }

    // MACD
    if (showMACD && macdData) {
      const macdAxisIndex = showVolume ? 2 : 1
      series.push(
        {
          name: 'DIF',
          type: 'line',
          xAxisIndex: macdAxisIndex,
          yAxisIndex: macdAxisIndex,
          data: macdData.dif,
          symbol: 'none',
          lineStyle: { width: 1 },
          itemStyle: { color: '#FF9800' },
        },
        {
          name: 'DEA',
          type: 'line',
          xAxisIndex: macdAxisIndex,
          yAxisIndex: macdAxisIndex,
          data: macdData.dea,
          symbol: 'none',
          lineStyle: { width: 1 },
          itemStyle: { color: '#2196F3' },
        },
        {
          name: 'MACD',
          type: 'bar',
          xAxisIndex: macdAxisIndex,
          yAxisIndex: macdAxisIndex,
          data: macdData.macd,
          itemStyle: {
            color: (params: any) => params.data >= 0 ? '#EF4444' : '#10B981',
          },
        }
      )
    }

    // 构建xAxis和yAxis
    const xAxis: any[] = [{
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { onZero: false },
      splitLine: { show: false },
      min: 'dataMin',
      max: 'dataMax',
    }]

    const yAxis: any[] = [{ scale: true, splitArea: { show: true } }]

    if (showVolume) {
      xAxis.push({
        type: 'category',
        gridIndex: 1,
        data: dates,
        boundaryGap: false,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
      })
      yAxis.push({
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      })
    }

    if (showMACD) {
      const gridIdx = showVolume ? 2 : 1
      xAxis.push({
        type: 'category',
        gridIndex: gridIdx,
        data: dates,
        boundaryGap: false,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
      })
      yAxis.push({
        gridIndex: gridIdx,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      })
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: { data: legendData, top: 10 },
      grid: grids,
      xAxis,
      yAxis,
      dataZoom: [
        { type: 'inside', xAxisIndex: xAxisIndexes, start: 60, end: 100 },
        { show: true, xAxisIndex: xAxisIndexes, type: 'slider', bottom: 10, start: 60, end: 100 },
      ],
      series,
    }

    chartInstance.current.setOption(option, true)
  }, [data, showMA, showMACD, showKDJ, showRSI, showBOLL, showVolume, maParams])

  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <div ref={chartRef} style={{ width: '100%', height }} />
}

export default KLineChart
