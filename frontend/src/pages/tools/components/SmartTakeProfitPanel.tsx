import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Tag, List, Space } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

interface TakeProfitPlan {
  stockCode: string;
  stockName: string;
  costPrice: number;
  currentPrice: number;
  profitRate: number;
  strategy: { type: string; name: string; description: string };
  actions: { trigger: string; action: string; ratio: number }[];
}

const SmartTakeProfitPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [plan, setPlan] = useState<TakeProfitPlan | null>({
    stockCode: '300750',
    stockName: '宁德时代',
    costPrice: 180,
    currentPrice: 245,
    profitRate: 36.1,
    strategy: { type: 'staged', name: '分批止盈', description: '盈利较高，建议分批锁定利润' },
    actions: [
      { trigger: '盈利30%', action: '卖出', ratio: 30 },
      { trigger: '盈利50%', action: '卖出', ratio: 30 },
      { trigger: '盈利70%', action: '清仓', ratio: 40 },
    ],
  });

  const handleGenerate = (values: any) => {
    console.log('Generate plan for:', values);
  };

  return (
    <Card title={<><RocketOutlined /> 智能止盈策略</>} size="small">
      <Form form={form} layout="inline" onFinish={handleGenerate} style={{ marginBottom: 16 }}>
        <Form.Item name="stockCode" rules={[{ required: true }]}>
          <Input placeholder="股票代码" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="costPrice" rules={[{ required: true }]}>
          <InputNumber placeholder="成本价" prefix="¥" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">生成策略</Button>
        </Form.Item>
      </Form>

      {plan && (
        <>
          <Space style={{ marginBottom: 12 }}>
            <span>{plan.stockName}</span>
            <Tag color="green">盈利 {plan.profitRate.toFixed(1)}%</Tag>
            <Tag color="blue">{plan.strategy.name}</Tag>
          </Space>
          <div style={{ color: '#666', marginBottom: 12 }}>{plan.strategy.description}</div>
          <List
            size="small"
            dataSource={plan.actions}
            renderItem={item => (
              <List.Item>
                <span>{item.trigger}</span>
                <Tag color="orange">{item.action} {item.ratio}%</Tag>
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  );
};

export default SmartTakeProfitPanel;
