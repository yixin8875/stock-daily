import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Select, Button, Table, Tag, Space } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

interface ConditionalOrder {
  id: string;
  stockCode: string;
  orderType: string;
  triggerPrice: number;
  status: string;
}

const AutoStopPanel: React.FC = () => {
  const [orders, setOrders] = useState<ConditionalOrder[]>([]);
  const [form] = Form.useForm();

  const handleAdd = (values: any) => {
    const newOrder: ConditionalOrder = {
      id: Date.now().toString(),
      stockCode: values.stockCode,
      orderType: values.orderType,
      triggerPrice: values.triggerPrice,
      status: 'active',
    };
    setOrders([...orders, newOrder]);
    form.resetFields();
  };

  const columns = [
    { title: '代码', dataIndex: 'stockCode', width: 80 },
    {
      title: '类型',
      dataIndex: 'orderType',
      render: (v: string) => (
        <Tag color={v === 'take_profit' ? 'green' : 'red'}>
          {v === 'take_profit' ? '止盈' : '止损'}
        </Tag>
      ),
    },
    { title: '触发价', dataIndex: 'triggerPrice', render: (v: number) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => <Tag color={v === 'active' ? 'blue' : 'default'}>{v === 'active' ? '监控中' : '已触发'}</Tag>,
    },
  ];

  return (
    <Card title={<><SafetyCertificateOutlined /> 自动止盈止损</>} size="small">
      <Form form={form} layout="inline" onFinish={handleAdd} style={{ marginBottom: 16 }}>
        <Form.Item name="stockCode" rules={[{ required: true }]}>
          <Input placeholder="股票代码" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item name="orderType" initialValue="stop_loss">
          <Select style={{ width: 80 }}>
            <Select.Option value="take_profit">止盈</Select.Option>
            <Select.Option value="stop_loss">止损</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="triggerPrice" rules={[{ required: true }]}>
          <InputNumber placeholder="触发价" style={{ width: 100 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">添加</Button>
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={orders} rowKey="id" size="small" pagination={false} />
    </Card>
  );
};

export default AutoStopPanel;
