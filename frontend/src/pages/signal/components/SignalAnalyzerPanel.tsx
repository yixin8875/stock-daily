import React, { useState } from 'react';
import { Card, Table, Tag, Row, Col, Statistic } from 'antd';
import { AlertOutlined } from '@ant-design/icons';

interface SignalRecord {
  id: string;
  stockCode: string;
  stockName: string;
  signalType: string;
  direction: string;
  price: number;
  result: string;
  profit: number;
}

const SignalAnalyzerPanel: React.FC = () => {
  const [signals] = useState<SignalRecord[]>([
    { id: '1', stockCode: '600519', stockName: '贵州茅台', signalType: 'MA交叉', direction: 'buy', price: 1800, result: 'win', profit: 2500 },
    { id: '2', stockCode: '000858', stockName: '五粮液', signalType: 'MACD金叉', direction: 'buy', price: 180, result: 'win', profit: 1200 },
    { id: '3', stockCode: '000001', stockName: '平安银行', signalType: 'KDJ超买', direction: 'sell', price: 12, result: 'loss', profit: -500 },
  ]);

  const winCount = signals.filter(s => s.result === 'win').length;
  const totalProfit = signals.reduce((s, r) => s + r.profit, 0);

  const columns = [
    { title: '代码', dataIndex: 'stockCode', key: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', key: 'stockName', width: 100 },
    { title: '信号类型', dataIndex: 'signalType', key: 'signalType' },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (v: string) => (
        <Tag color={v === 'buy' ? 'green' : 'red'}>
          {v === 'buy' ? '买入' : '卖出'}
        </Tag>
      ),
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (v: string) => (
        <Tag color={v === 'win' ? 'green' : 'red'}>
          {v === 'win' ? '盈利' : '亏损'}
        </Tag>
      ),
    },
    {
      title: '盈亏',
      dataIndex: 'profit',
      key: 'profit',
      render: (v: number) => (
        <span style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>
          ¥{v.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <Card title={<><AlertOutlined /> 信号分析器</>}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title="信号胜率"
            value={Math.round((winCount / signals.length) * 100)}
            suffix="%"
          />
        </Col>
        <Col span={8}>
          <Statistic title="信号总数" value={signals.length} />
        </Col>
        <Col span={8}>
          <Statistic
            title="总盈亏"
            value={totalProfit}
            prefix="¥"
            valueStyle={{ color: totalProfit >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={signals}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </Card>
  );
};

export default SignalAnalyzerPanel;
