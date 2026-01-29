import React, { useState } from 'react';
import { Card, Form, InputNumber, Select, Button, Table, Tag, Space, Row, Col, Statistic } from 'antd';
import { CalculatorOutlined, DollarOutlined } from '@ant-design/icons';

interface DipSchedule {
  date: string;
  amount: number;
  multiplier: number;
  reason: string;
}

const SmartDipPlanner: React.FC = () => {
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState<DipSchedule[]>([]);
  const [summary, setSummary] = useState<{ total: number; avgMultiplier: number } | null>(null);

  const handleGenerate = async (values: any) => {
    // 模拟生成定投计划
    const { baseAmount, frequency, currentPE, lowThreshold, highThreshold, months } = values;

    const interval = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30;
    const totalDays = months * 30;
    const now = new Date();
    const newSchedules: DipSchedule[] = [];

    for (let day = 0; day < totalDays; day += interval) {
      const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      let multiplier = 1;
      let reason = '常规定投';

      if (currentPE < lowThreshold * 0.8) {
        multiplier = 2.0;
        reason = '极度低估，双倍定投';
      } else if (currentPE < lowThreshold) {
        multiplier = 1.5;
        reason = '低估区间，1.5倍定投';
      } else if (currentPE > highThreshold * 1.2) {
        multiplier = 0;
        reason = '极度高估，暂停定投';
      } else if (currentPE > highThreshold) {
        multiplier = 0.5;
        reason = '高估区间，减半定投';
      }

      newSchedules.push({
        date: date.toISOString().split('T')[0],
        amount: Math.round(baseAmount * multiplier),
        multiplier,
        reason,
      });
    }

    setSchedules(newSchedules);
    const total = newSchedules.reduce((sum, s) => sum + s.amount, 0);
    const avgMultiplier = newSchedules.reduce((sum, s) => sum + s.multiplier, 0) / newSchedules.length;
    setSummary({ total, avgMultiplier });
  };

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    {
      title: '定投金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '倍数',
      dataIndex: 'multiplier',
      key: 'multiplier',
      render: (v: number) => (
        <Tag color={v >= 1.5 ? 'green' : v >= 1 ? 'blue' : v > 0 ? 'orange' : 'red'}>
          {v}x
        </Tag>
      ),
    },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
  ];

  return (
    <Card title={<><CalculatorOutlined /> 智能定投计划</>}>
      <Form form={form} layout="vertical" onFinish={handleGenerate}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="baseAmount" label="基础定投金额" initialValue={1000}>
              <InputNumber min={100} step={100} style={{ width: '100%' }} prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="frequency" label="定投频率" initialValue="monthly">
              <Select>
                <Select.Option value="weekly">每周</Select.Option>
                <Select.Option value="biweekly">每两周</Select.Option>
                <Select.Option value="monthly">每月</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="months" label="计划月数" initialValue={12}>
              <InputNumber min={1} max={60} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="currentPE" label="当前PE估值" initialValue={15}>
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="lowThreshold" label="低估阈值" initialValue={12}>
              <InputNumber min={1} max={50} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="highThreshold" label="高估阈值" initialValue={20}>
              <InputNumber min={10} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<DollarOutlined />}>
            生成定投计划
          </Button>
        </Form.Item>
      </Form>

      {summary && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Statistic title="计划总投入" value={summary.total} prefix="¥" />
          </Col>
          <Col span={12}>
            <Statistic title="平均倍数" value={summary.avgMultiplier.toFixed(2)} suffix="x" />
          </Col>
        </Row>
      )}

      {schedules.length > 0 && (
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="date"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );
};

export default SmartDipPlanner;
