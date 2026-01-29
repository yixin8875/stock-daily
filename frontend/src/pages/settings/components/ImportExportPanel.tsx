import React, { useState } from 'react';
import { Card, Upload, Button, Table, message, Tabs } from 'antd';
import { ImportOutlined, ExportOutlined, UploadOutlined } from '@ant-design/icons';

const ImportExportPanel: React.FC = () => {
  const [importData, setImportData] = useState<any[]>([]);

  const exportOptions = [
    { key: 'diary', label: '交易日记', format: 'xlsx' },
    { key: 'trades', label: '交易记录', format: 'csv' },
    { key: 'positions', label: '持仓数据', format: 'xlsx' },
    { key: 'watchlist', label: '自选股', format: 'csv' },
  ];

  const handleExport = (type: string) => {
    message.success(`正在导出${type}数据...`);
  };

  const items = [
    {
      key: 'export',
      label: '数据导出',
      children: (
        <Table
          dataSource={exportOptions}
          rowKey="key"
          columns={[
            { title: '数据类型', dataIndex: 'label' },
            { title: '格式', dataIndex: 'format' },
            {
              title: '操作',
              render: (_, r) => (
                <Button size="small" onClick={() => handleExport(r.label)}>
                  导出
                </Button>
              ),
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: 'import',
      label: '数据导入',
      children: (
        <Upload
          accept=".csv,.xlsx"
          beforeUpload={() => false}
          onChange={(info) => {
            if (info.file) {
              message.success('文件已选择，准备导入');
            }
          }}
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
      ),
    },
  ];

  return (
    <Card title={<><ImportOutlined /> 数据导入导出</>}>
      <Tabs items={items} />
    </Card>
  );
};

export default ImportExportPanel;
