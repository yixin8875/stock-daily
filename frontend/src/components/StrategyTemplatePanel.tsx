import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { PlusOutlined, PlayCircleOutlined } from '@ant-design/icons';

interface StrategyTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  params: {
    stopLoss?: number;
    takeProfit?: number;
    positionSize?: number;
  };
  usageCount: number;
}

interface Props {
  onSelect?: (template: StrategyTemplate) => void;
}

const categoryMap: Record<string, string> = {
  trend: '趋势跟踪',
  reversal: '反转策略',
  breakout: '突破策略',
  grid: '网格策略',
};

const StrategyTemplatePanel: React.FC<Props> = ({ onSelect }) => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<StrategyTemplate[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/strategies');
      const data = await res.json();
      if (data.success) setTemplates(data.data);
    } catch { message.error('获取策略失败'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (values: any) => {
    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          category: values.category,
          params: {
            stopLoss: values.stopLoss,
            takeProfit: values.takeProfit,
            positionSize: values.positionSize,
          },
        }),
      });
      if (res.ok) {
        message.success('创建成功');
        setModalVisible(false);
        fetchTemplates();
      }
    } catch { message.error('创建失败'); }
  };

  return (
    <Card
      title="策略模板库"
      extra={<Button icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建</Button>}
      loading={loading}
    >
      <List
        dataSource={templates}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<PlayCircleOutlined />}
                onClick={() => onSelect?.(item)}
              >
                使用
              </Button>
            ]}
          >
            <List.Item.Meta
              title={<><Tag color="blue">{categoryMap[item.category]}</Tag> {item.name}</>}
              description={item.description || `止损${item.params.stopLoss}% 止盈${item.params.takeProfit}%`}
            />
            <span style={{ color: '#999' }}>使用{item.usageCount}次</span>
          </List.Item>
        )}
      />

      <Modal title="新建策略" open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="策略名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="策略类型" rules={[{ required: true }]}>
            <Select options={Object.entries(categoryMap).map(([k, v]) => ({ value: k, label: v }))} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="stopLoss" label="止损比例(%)" initialValue={5}>
            <InputNumber min={1} max={50} />
          </Form.Item>
          <Form.Item name="takeProfit" label="止盈比例(%)" initialValue={10}>
            <InputNumber min={1} max={100} />
          </Form.Item>
          <Form.Item name="positionSize" label="仓位比例(%)" initialValue={30}>
            <InputNumber min={10} max={100} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default StrategyTemplatePanel;
