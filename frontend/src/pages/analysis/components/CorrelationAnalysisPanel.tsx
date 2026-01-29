import React, { useState } from 'react';
import { Card, Form, Input, Button, Table, Tag } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

interface CorrelationResult {
  stock1: string;
  stock2: string;
  correlation: number;
  description: string;
}

const CorrelationAnalysisPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState<CorrelationResult[]>([]);

  const handleAnalyze = (values: any) => {
    const codes = values.stockCodes.split(',').map((s: string) => s.trim());
    const newResults: CorrelationResult[] = [];

    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const corr = Math.round((Math.random() * 2 - 1) * 100) / 100;
        newResults.push({
          stock1: codes[i],
          stock2: codes[j],
          correlation: corr,
          description: corr > 0.7 ? '高度正相关' :
                       corr > 0.3 ? '中度正相关' :
                       corr > -0.3 ? '弱相关' :
                       corr > -0.7 ? '中度负相关' : '高度负相关',
        });
      }
    }
    setResults(newResults);
  };

  const columns = [
    { title: '股票1', dataIndex: 'stock1', key: 'stock1' },
    { title: '股票2', dataIndex: 'stock2', key: 'stock2' },
    {
      title: '相关系数',
      dataIndex: 'correlation',
      key: 'correlation',
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#3f8600' : '#cf1322' }}>{v}</span>
      ),
    },
    {
      title: '相关性',
      dataIndex: 'description',
      key: 'description',
      render: (v: string) => <Tag>{v}</Tag>,
    },
  ];

  return (
    <Card title={<><LineChartOutlined /> 相关性分析</>}>
      <Form form={form} layout="inline" onFinish={handleAnalyze} style={{ marginBottom: 16 }}>
        <Form.Item name="stockCodes" label="股票代码" initialValue="000001,600519,000858">
          <Input placeholder="逗号分隔" style={{ width: 250 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">分析相关性</Button>
        </Form.Item>
      </Form>
      {results.length > 0 && (
        <Table columns={columns} dataSource={results} rowKey={(r) => `${r.stock1}-${r.stock2}`} size="small" />
      )}
    </Card>
  );
};

export default CorrelationAnalysisPanel;
