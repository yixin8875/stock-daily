import React, { useState } from 'react';
import { Card, Row, Col, Select, Tag } from 'antd';
import { HeatMapOutlined } from '@ant-design/icons';

interface HeatmapCell {
  label: string;
  value: number;
  count: number;
}

const TradeHeatmapPanel: React.FC = () => {
  const [view, setView] = useState('hour');

  const [data] = useState({
    byHour: [
      { label: '9:30', value: 125000, count: 15 },
      { label: '10:30', value: 85000, count: 10 },
      { label: '11:30', value: 45000, count: 5 },
      { label: '14:00', value: 95000, count: 12 },
    ],
    byWeekday: [
      { label: '周一', value: 150000, count: 18 },
      { label: '周二', value: 120000, count: 14 },
      { label: '周三', value: 80000, count: 8 },
      { label: '周四', value: 110000, count: 12 },
      { label: '周五', value: 90000, count: 10 },
    ],
    bySector: [
      { label: '创业板', value: 180000, count: 20 },
      { label: '沪市主板', value: 150000, count: 15 },
      { label: '科创板', value: 80000, count: 8 },
      { label: '深市主板', value: 60000, count: 6 },
    ],
  });

  const currentData = view === 'hour' ? data.byHour :
                      view === 'weekday' ? data.byWeekday : data.bySector;
  const maxValue = Math.max(...currentData.map(d => d.value));

  const getColor = (value: number) => {
    const ratio = value / maxValue;
    if (ratio > 0.8) return '#f5222d';
    if (ratio > 0.6) return '#fa8c16';
    if (ratio > 0.4) return '#fadb14';
    if (ratio > 0.2) return '#a0d911';
    return '#52c41a';
  };

  return (
    <Card
      title={<><HeatMapOutlined /> 交易热力图</>}
      size="small"
      extra={
        <Select value={view} onChange={setView} size="small" style={{ width: 100 }}>
          <Select.Option value="hour">按时段</Select.Option>
          <Select.Option value="weekday">按星期</Select.Option>
          <Select.Option value="sector">按板块</Select.Option>
        </Select>
      }
    >
      <Row gutter={[8, 8]}>
        {currentData.map(item => (
          <Col span={6} key={item.label}>
            <div
              style={{
                background: getColor(item.value),
                padding: 12,
                borderRadius: 4,
                textAlign: 'center',
                color: '#fff',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{item.label}</div>
              <div style={{ fontSize: 12 }}>¥{(item.value / 10000).toFixed(1)}万</div>
              <Tag style={{ marginTop: 4 }}>{item.count}笔</Tag>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default TradeHeatmapPanel;
