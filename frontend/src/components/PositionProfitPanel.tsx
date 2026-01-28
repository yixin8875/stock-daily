import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Spin, Row, Col, Statistic, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { positionService } from '@/services';

interface PositionItem {
  stockCode: string;
  stockName: string;
  quantity: number;
  costPrice: number;
  currentPrice: number;
  marketValue: number;
  profit: number;
  profitRate: number;
}

interface PortfolioData {
  totalCost: number;
  totalMarketValue: number;
  totalProfit: number;
  totalProfitRate: number;
  positions: PositionItem[];
}

const PositionProfitPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PortfolioData | null>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await positionService.getAnalysis();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    } finally {
      setLoading(false);
    }
  };

  // 持仓分布饼图
  useEffect(() => {
    if (!data?.positions.length || !pieRef.current) return;
    const chart = echarts.init(pieRef.current);
    const option = {
      tooltip: { trigger: 'item', formatter: '{b}: {c}元 ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        label: { show: true, formatter: '{b}' },
        data: data.positions.map(p => ({
          name: p.stockName,
          value: Math.round(p.marketValue),
        })),
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [data]);

  // 盈亏柱状图
  useEffect(() => {
    if (!data?.positions.length || !barRef.current) return;
    const chart = echarts.init(barRef.current);
    const sorted = [...data.positions].sort((a, b) => b.profit - a.profit);
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: sorted.map(p => p.stockName), axisLabel: { rotate: 45 } },
      yAxis: { type: 'value', name: '盈亏(元)' },
      series: [{
        type: 'bar',
        data: sorted.map(p => ({
          value: Math.round(p.profit),
          itemStyle: { color: p.profit >= 0 ? '#EF4444' : '#10B981' },
        })),
      }],
    };
    chart.setOption(option);
    return () => chart.dispose();
  }, [data]);

  const columns = [
    { title: '股票', dataIndex: 'stockName', key: 'stockName', width: 100 },
    { title: '持仓', dataIndex: 'quantity', key: 'quantity', render: (v: number) => `${v}股` },
    { title: '成本', dataIndex: 'costPrice', key: 'costPrice', render: (v: number) => v.toFixed(2) },
    { title: '现价', dataIndex: 'currentPrice', key: 'currentPrice', render: (v: number) => v.toFixed(2) },
    { title: '市值', dataIndex: 'marketValue', key: 'marketValue', render: (v: number) => `${v.toFixed(0)}元` },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#EF4444' : '#10B981' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(0)}元
        </span>
      ),
      sorter: (a: PositionItem, b: PositionItem) => b.profit - a.profit,
    },
    {
      title: '收益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'red' : 'green'}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</Tag>
      ),
    },
  ];

  if (loading) return <Spin />;
  if (!data) return <div>暂无持仓数据</div>;

  return (
    <Card title="持仓盈亏分析">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic title="总成本" value={data.totalCost} precision={0} suffix="元" />
        </Col>
        <Col span={6}>
          <Statistic title="总市值" value={data.totalMarketValue} precision={0} suffix="元" />
        </Col>
        <Col span={6}>
          <Statistic
            title="总盈亏"
            value={data.totalProfit}
            precision={0}
            suffix="元"
            valueStyle={{ color: data.totalProfit >= 0 ? '#EF4444' : '#10B981' }}
            prefix={data.totalProfit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="总收益率"
            value={data.totalProfitRate}
            precision={2}
            suffix="%"
            valueStyle={{ color: data.totalProfitRate >= 0 ? '#EF4444' : '#10B981' }}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}><div ref={pieRef} style={{ height: 250 }} /></Col>
        <Col span={12}><div ref={barRef} style={{ height: 250 }} /></Col>
      </Row>
      <Table dataSource={data.positions} columns={columns} rowKey="stockCode" size="small" pagination={false} />
    </Card>
  );
};

export default PositionProfitPanel;
