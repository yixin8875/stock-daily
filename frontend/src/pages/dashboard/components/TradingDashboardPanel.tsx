import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { DashboardOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const TradingDashboardPanel: React.FC = () => {
  return (
    <Card title={<><DashboardOutlined /> 交易仪表盘</>}>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic title="今日盈亏" value={2580} prefix="¥" valueStyle={{ color: '#3f8600' }} />
        </Col>
        <Col span={6}>
          <Statistic title="本周盈亏" value={8500} prefix="¥" valueStyle={{ color: '#3f8600' }} />
        </Col>
        <Col span={6}>
          <Statistic title="本月盈亏" value={-1200} prefix="¥" valueStyle={{ color: '#cf1322' }} />
        </Col>
        <Col span={6}>
          <Statistic title="总资产" value={258000} prefix="¥" />
        </Col>
      </Row>
    </Card>
  );
};

export default TradingDashboardPanel;
