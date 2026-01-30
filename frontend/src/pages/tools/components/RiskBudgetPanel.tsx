import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';

interface RiskAlert {
  type: string;
  message: string;
  level: 'warning' | 'danger';
}

const RiskBudgetPanel: React.FC = () => {
  const [budget] = useState({
    totalBudget: 25000,
    usedBudget: 18500,
    remainingBudget: 6500,
    dailyLimit: 5000,
    positionLimit: 62500,
    sectorLimit: 100000,
  });

  const [alerts] = useState<RiskAlert[]>([
    { type: 'position', message: '贵州茅台仓位32%超过30%限制', level: 'danger' },
    { type: 'sector', message: '白酒行业占比38%接近40%限制', level: 'warning' },
  ]);

  const usedPercent = (budget.usedBudget / budget.totalBudget) * 100;

  return (
    <Card title={<><SafetyOutlined /> 风险预算管理</>} size="small">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="总风险预算" value={budget.totalBudget} prefix="¥" />
        </Col>
        <Col span={8}>
          <Statistic title="已用预算" value={budget.usedBudget} prefix="¥" />
        </Col>
        <Col span={8}>
          <Statistic
            title="剩余预算"
            value={budget.remainingBudget}
            prefix="¥"
            valueStyle={{ color: budget.remainingBudget > 0 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>预算使用率</div>
        <Progress
          percent={usedPercent}
          status={usedPercent > 90 ? 'exception' : usedPercent > 70 ? 'active' : 'normal'}
          strokeColor={usedPercent > 90 ? '#f5222d' : usedPercent > 70 ? '#faad14' : '#52c41a'}
        />
      </div>

      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>风险预警</div>
      <List
        size="small"
        dataSource={alerts}
        renderItem={item => (
          <List.Item>
            <Tag color={item.level === 'danger' ? 'red' : 'orange'}>
              {item.level === 'danger' ? '危险' : '警告'}
            </Tag>
            {item.message}
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RiskBudgetPanel;
