import React, { useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Select, Space } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';

interface StrategyTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  usageCount: number;
}

const StrategyTemplatePanel: React.FC = () => {
  const [templates, setTemplates] = useState<StrategyTemplate[]>([
    { id: '1', name: '均线突破', category: 'trend', description: '价格突破20日均线买入', usageCount: 15 },
    { id: '2', name: 'MACD金叉', category: 'trend', description: 'MACD金叉确认后买入', usageCount: 12 },
    { id: '3', name: '网格交易', category: 'grid', description: '固定区间高抛低吸', usageCount: 8 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: '策略名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      render: (v: string) => (
        <Tag color={v === 'trend' ? 'blue' : v === 'grid' ? 'green' : 'orange'}>
          {v === 'trend' ? '趋势' : v === 'grid' ? '网格' : '反转'}
        </Tag>
      ),
    },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '使用次数', dataIndex: 'usageCount', key: 'usageCount' },
    {
      title: '操作',
      render: () => (
        <Space>
          <Button size="small">应用</Button>
          <Button size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<><FileTextOutlined /> 策略模板</>}
      extra={<Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建</Button>}
    >
      <Table columns={columns} dataSource={templates} rowKey="id" size="small" />

      <Modal
        title="新建策略模板"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => {
          form.validateFields().then(() => {
            setModalVisible(false);
          });
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="策略名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="策略类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="trend">趋势策略</Select.Option>
              <Select.Option value="grid">网格策略</Select.Option>
              <Select.Option value="reversal">反转策略</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="策略描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StrategyTemplatePanel;
