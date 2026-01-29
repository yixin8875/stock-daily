import React, { useState } from 'react';
import { Card, Calendar, Badge, Tag, List } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

interface CalendarEvent {
  date: string;
  type: 'earnings' | 'dividend' | 'ipo' | 'holiday' | 'custom';
  title: string;
  stockCode?: string;
}

const TradingCalendar: React.FC = () => {
  const [events] = useState<CalendarEvent[]>([
    { date: '2025-01-01', type: 'holiday', title: '元旦' },
    { date: '2025-01-15', type: 'dividend', title: '贵州茅台除息', stockCode: '600519' },
    { date: '2025-01-20', type: 'earnings', title: '平安银行年报', stockCode: '000001' },
  ]);

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    return events.filter(e => e.date === dateStr);
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, i) => (
          <li key={i}>
            <Badge
              status={
                item.type === 'holiday' ? 'error' :
                item.type === 'dividend' ? 'success' :
                item.type === 'earnings' ? 'processing' : 'default'
              }
              text={<span style={{ fontSize: 10 }}>{item.title}</span>}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card title={<><CalendarOutlined /> 交易日历</>}>
      <Calendar cellRender={dateCellRender} />
    </Card>
  );
};

export default TradingCalendar;
