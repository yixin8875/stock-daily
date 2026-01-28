import React, { useEffect, useState, useRef } from 'react';
import { Card, Spin, Table, Tag } from 'antd';
import * as echarts from 'echarts';
import { stockApi } from '@/services';

interface MoneyFlowItem {
  code: string;
  name: string;
  mainInflow: number;
  mainOutflow: number;
  mainNet: number;
  retailNet: number;
  totalNet: number;
}

const MoneyFlowHeatmap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MoneyFlowItem[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await stockApi.getMoneyFlow(30);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch money flow:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data.length || !chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    const treemapData = data.slice(0, 20).map(item => ({
      name: item.name,
      value: Math.abs(item.mainNet),
      itemStyle: {
        color: item.mainNet >= 0 ?
          `rgba(239, 68, 68, ${Math.min(Math.abs(item.mainNet) / 5 + 0.3, 1)})` :
          `rgba(16, 185, 129, ${Math.min(Math.abs(item.mainNet) / 5 + 0.3, 1)})`,
      },
    }));

    const option = {
      tooltip: {
        formatter: (params: any) => {
          const item = data.find(d => d.name === params.name);
          if (!item) return '';
          return `${item.name}<br/>主力净流入: ${item.mainNet.toFixed(2)}亿`;
        },
      },
      series: [{
        type: 'treemap',
        data: treemapData,
        label: { show: true, formatter: '{b}' },
        breadcrumb: { show: false },
      }],
    };

    chart.setOption(option);
    return () => chart.dispose();
  }, [data]);

  const columns = [
    { title: '股票', dataIndex: 'name', key: 'name', width: 100 },
    {
      title: '主力净流入',
      dataIndex: 'mainNet',
      key: 'mainNet',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'red' : 'green'}>{v.toFixed(2)}亿</Tag>
      ),
      sorter: (a: MoneyFlowItem, b: MoneyFlowItem) => b.mainNet - a.mainNet,
    },
    {
      title: '散户净流入',
      dataIndex: 'retailNet',
      key: 'retailNet',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#EF4444' : '#10B981' }}>
          {v.toFixed(2)}亿
        </span>
      ),
    },
  ];

  if (loading) return <Spin />;

  return (
    <Card title="资金流向热力图">
      <div ref={chartRef} style={{ height: 300, marginBottom: 16 }} />
      <Table
        dataSource={data}
        columns={columns}
        rowKey="code"
        size="small"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default MoneyFlowHeatmap;
