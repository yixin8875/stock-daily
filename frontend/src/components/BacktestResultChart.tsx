import React, { useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';

interface BacktestTrade {
  date: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  signal: string;
  profit?: number;
}

interface BacktestResult {
  trades: BacktestTrade[];
  totalTrades: number;
  winTrades: number;
  lossTrades: number;
  winRate: number;
  totalProfit: number;
  totalProfitRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  finalCapital: number;
  capitalHistory?: number[];
}

interface Props {
  result: BacktestResult;
  initialCapital?: number;
}

const BacktestResultChart: React.FC<Props> = ({ result, initialCapital = 100000 }) => {
  const equityRef = useRef<HTMLDivElement>(null);
  const distributionRef = useRef<HTMLDivElement>(null);

  // 资金曲线图
  useEffect(() => {
    if (!equityRef.current || !result.capitalHistory?.length) return;
    const chart = echarts.init(equityRef.current);
    const option = {
      title: { text: '资金曲线', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: result.capitalHistory.map((_, i) => i + 1) },
      yAxis: { type: 'value', name: '资金(元)' },
      series: [{
        type: 'line',
        data: result.capitalHistory,
        smooth: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { color: '#1890FF' },
        itemStyle: { color: '#1890FF' },
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [result.capitalHistory]);

  // 盈亏分布图
  useEffect(() => {
    if (!distributionRef.current) return;
    const chart = echarts.init(distributionRef.current);
    const profits = result.trades.filter(t => t.profit !== undefined).map(t => t.profit!);
    const option = {
      title: { text: '盈亏分布', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '60%',
        data: [
          { value: result.winTrades, name: '盈利', itemStyle: { color: '#EF4444' } },
          { value: result.lossTrades, name: '亏损', itemStyle: { color: '#10B981' } },
        ],
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [result]);

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date', width: 100 },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => <Tag color={v === 'buy' ? 'red' : 'green'}>{v === 'buy' ? '买入' : '卖出'}</Tag>,
    },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => v.toFixed(2) },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '信号', dataIndex: 'signal', key: 'signal' },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v?: number) => v !== undefined ? (
        <span style={{ color: v >= 0 ? '#EF4444' : '#10B981' }}>{v >= 0 ? '+' : ''}{v.toFixed(0)}</span>
      ) : '-',
    },
  ];

  return (
    <Card title="回测结果">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Statistic title="总交易" value={result.totalTrades} suffix="笔" /></Col>
        <Col span={4}><Statistic title="胜率" value={result.winRate} precision={1} suffix="%" valueStyle={{ color: result.winRate >= 50 ? '#EF4444' : '#10B981' }} /></Col>
        <Col span={4}>
          <Statistic title="总收益" value={result.totalProfit} precision={0} suffix="元"
            valueStyle={{ color: result.totalProfit >= 0 ? '#EF4444' : '#10B981' }}
            prefix={result.totalProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} />
        </Col>
        <Col span={4}><Statistic title="收益率" value={result.totalProfitRate} precision={2} suffix="%" valueStyle={{ color: result.totalProfitRate >= 0 ? '#EF4444' : '#10B981' }} /></Col>
        <Col span={4}><Statistic title="最大回撤" value={result.maxDrawdown} precision={2} suffix="%" valueStyle={{ color: '#F97316' }} /></Col>
        <Col span={4}><Statistic title="夏普比率" value={result.sharpeRatio} precision={2} /></Col>
      </Row>
      <Row gutter={16}>
        <Col span={14}><div ref={equityRef} style={{ height: 250 }} /></Col>
        <Col span={10}><div ref={distributionRef} style={{ height: 250 }} /></Col>
      </Row>
      <Table dataSource={result.trades} columns={columns} rowKey={(_, i) => String(i)} size="small" pagination={{ pageSize: 10 }} style={{ marginTop: 16 }} />
    </Card>
  );
};

export default BacktestResultChart;
