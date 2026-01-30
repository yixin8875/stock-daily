import React, { useState } from 'react';
import { Card, List, Tag, Empty } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

interface BlackSwanAlert {
  type: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  timestamp: string;
}

const BlackSwanAlert: React.FC = () => {
  const [alerts] = useState<BlackSwanAlert[]>([]);

  const severityMap = {
    critical: { color: 'red', text: '严重' },
    high: { color: 'orange', text: '高' },
    medium: { color: 'blue', text: '中' },
  };

  return (
    <Card title={<><WarningOutlined /> 黑天鹅预警</>} size="small">
      {alerts.length === 0 ? (
        <Empty description="暂无预警" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={alerts}
          renderItem={(item) => (
            <List.Item>
              <Tag color={severityMap[item.severity].color}>
                {severityMap[item.severity].text}
              </Tag>
              {item.description}
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default BlackSwanAlert;
