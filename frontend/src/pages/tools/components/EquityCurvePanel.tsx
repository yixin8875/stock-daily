import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Select } from 'antd';
import { LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface EquityPoint {
  date: string;
  equity: number;
  dailyReturn: number;
  drawdown: number;
}

const EquityCurvePanel: React.FC = () => {
  const [period, setPeriod] = useState('30');
  const [analysis] = useState({
    curve: [
      { date: '2025-01-20', equity: 100000, dailyReturn: 0, drawdown: 0 },
      { date: '2025-01-21', equity: 102500, dailyReturn: 2.5, drawdown: 0 },
      { date: '2025-01-22', equity: 101200, dailyReturn: -1.27, drawdown: 1.27 },
      { date: '2025-01-23', equity: 104800, dailyReturn: 3.56, drawdown: 0 },
      { date: '2025-01-24', equity: 103500, dailyReturn: -1.24, drawdown: 1.24 },
    ] as EquityPoint[],
    totalReturn: 3.5,
    maxDrawdown: 1.27,
    sharpeRatio: 1.85,
    winRate: 60,
    profitFactor: 2.1,
  });

  return (
    <Card
      title={<><LineChartOutlined /> 资金曲线分析</>}
      size="small"
      extra={
        <Select value={period} onChange={setPeriod} size="small" style={{ width: 100 }}>
          <Select.Option value="7">近7天</Select.Option>
          <Select.Option value="30">近30天</Select.Option>
          <Select.Option value="90">近90天</Select.Option>
        </Select>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic
            title="总收益率"
            value={analysis.totalReturn}
            precision={2}
            suffix="%"
            prefix={analysis.totalReturn >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{ color: analysis.totalReturn >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="最大回撤"
            value={analysis.maxDrawdown}
            precision={2}
            suffix="%"
            valueStyle={{ color: '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic title="夏普比率" value={analysis.sharpeRatio} precision={2} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="胜率" value={analysis.winRate} suffix="%" />
        </Col>
        <Col span={8}>
          <Statistic title="盈亏比" value={analysis.profitFactor} precision={2} />
        </Col>
        <Col span={8}>
          <Statistic
            title="当前净值"
            value={analysis.curve[analysis.curve.length - 1]?.equity}
            prefix="¥"
          />
        </Col>
      </Row>
    </Card>
  );
};

export default EquityCurvePanel;
