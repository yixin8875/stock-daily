import React, { useEffect, useState } from 'react';
import { Card, Calendar, Badge, Modal, List, Tag, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { tradeService } from '@/services';

interface DayTrade {
  stockName: string;
  direction: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  amount: number;
}

interface DaySummary {
  date: string;
  trades: DayTrade[];
  profit: number;
  tradeCount: number;
}

const TradeReviewCalendar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Map<string, DaySummary>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await tradeService.getCalendar();
      if (res.data.success) {
        const map = new Map<string, DaySummary>();
        res.data.data.forEach((item: any) => {
          map.set(item.date, item);
        });
        setData(map);
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const summary = data.get(dateStr);
    if (!summary) return null;

    return (
      <div onClick={() => { setSelectedDate(dateStr); setModalVisible(true); }}>
        <Badge
          status={summary.profit >= 0 ? 'success' : 'error'}
          text={`${summary.profit >= 0 ? '+' : ''}${summary.profit.toFixed(0)}`}
        />
        <div style={{ fontSize: 10, color: '#999' }}>{summary.tradeCount}笔</div>
      </div>
    );
  };

  const selectedSummary = selectedDate ? data.get(selectedDate) : null;

  if (loading) return <Spin />;

  return (
    <Card title="交易复盘日历">
      <Calendar cellRender={dateCellRender} />
      <Modal
        title={`${selectedDate} 交易记录`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedSummary && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Tag color={selectedSummary.profit >= 0 ? 'red' : 'green'}>
                当日盈亏: {selectedSummary.profit >= 0 ? '+' : ''}{selectedSummary.profit.toFixed(0)}元
              </Tag>
              <Tag>交易笔数: {selectedSummary.tradeCount}</Tag>
            </div>
            <List
              dataSource={selectedSummary.trades}
              renderItem={(trade) => (
                <List.Item>
                  <List.Item.Meta
                    title={trade.stockName}
                    description={`${trade.direction === 'BUY' ? '买入' : '卖出'} ${trade.quantity}股 @ ${trade.price}`}
                  />
                  <Tag color={trade.direction === 'BUY' ? 'red' : 'green'}>
                    {trade.amount.toFixed(0)}元
                  </Tag>
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    </Card>
  );
};

export default TradeReviewCalendar;
