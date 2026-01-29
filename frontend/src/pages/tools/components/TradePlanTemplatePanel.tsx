import React, { useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Space } from 'antd';
import { ProfileOutlined, PlusOutlined } from '@ant-design/icons';

interface TradePlan {
  id: string;
  stockCode: string;
  stockName: string;
  direction: string;
  entryPrice: number;
  targetPrice: number;
  stopPrice: number;
  status: string;
}

const TradePlanTemplatePanel: React.FC = () => {
  const [plans, setPlans] = useState<TradePlan[]>([
    { id: '1', stockCode: '600519', stockName: '贵州茅台', direction: 'buy', entryPrice: 1800, targetPrice: 2000, stopPrice: 1700, status: 'pending' },
    { id: '2', stockCode: '000858', stockName: '五粮液', direction: 'buy', entryPrice: 175, targetPrice: 200, stopPrice: 165, status: 'executed' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: '代码', dataIndex: 'stockCode', key: 'stockCode', width: 80 },
    { title: '名称', dataIndex: 'stockName', key: 'stockName', width: 100 },
    {
      title: '方向',
      dataIndex: 'direction',
      key: 'direction',
      render: (v: string) => <Tag color={v === 'buy' ? 'green' : 'red'}>{v === 'buy' ? '买入' : '卖出'}</Tag>,
    },
    { title: '入场价', dataIndex: 'entryPrice', key: 'entryPrice', render: (v: number) => `¥${v}` },
    { title: '目标价', dataIndex: 'targetPrice', key: 'targetPrice', render: (v: number) => `¥${v}` },
    { title: '止损价', dataIndex: 'stopPrice', key: 'stopPrice', render: (v: number) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={v === 'pending' ? 'blue' : v === 'executed' ? 'green' : 'default'}>{v === 'pending' ? '待执行' : '已执行'}</Tag>,
    },
  ];

  return (
    <Card title={<><ProfileOutlined /> 交易计划</>} extra={<Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建</Button>}>
      <Table columns={columns} dataSource={plans} rowKey="id" size="small" />
      <Modal title="新建交易计划" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="entryPrice" label="入场价"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="targetPrice" label="目标价"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="stopPrice" label="止损价"><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TradePlanTemplatePanel;
