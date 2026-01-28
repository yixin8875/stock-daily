import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, Modal, Form, Input, Space, Dropdown, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

interface WatchlistGroup {
  id: string;
  name: string;
  color: string;
  _count: { watchlists: number };
}

interface Props {
  groups: WatchlistGroup[];
  selectedGroupId: string | null;
  onSelect: (groupId: string | null) => void;
  onRefresh: () => void;
}

const WatchlistGroupPanel: React.FC<Props> = ({ groups, selectedGroupId, onSelect, onRefresh }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WatchlistGroup | null>(null);
  const [form] = Form.useForm();

  const handleCreate = () => {
    setEditingGroup(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (group: WatchlistGroup) => {
    setEditingGroup(group);
    form.setFieldsValue({ name: group.name, color: group.color });
    setModalVisible(true);
  };

  const handleDelete = async (groupId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除分组后，该分组下的股票将移至未分组',
      onOk: async () => {
        try {
          const res = await fetch(`/api/watchlist-groups/${groupId}`, { method: 'DELETE' });
          if (res.ok) {
            message.success('删除成功');
            onRefresh();
          }
        } catch { message.error('删除失败'); }
      },
    });
  };

  const handleSubmit = async (values: { name: string; color: string }) => {
    try {
      const url = editingGroup ? `/api/watchlist-groups/${editingGroup.id}` : '/api/watchlist-groups';
      const method = editingGroup ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        message.success(editingGroup ? '更新成功' : '创建成功');
        setModalVisible(false);
        onRefresh();
      }
    } catch { message.error('操作失败'); }
  };

  const getMenuItems = (group: WatchlistGroup): MenuProps['items'] => [
    { key: 'edit', label: '编辑', icon: <EditOutlined />, onClick: () => handleEdit(group) },
    { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(group.id) },
  ];

  return (
    <Card
      title="分组"
      size="small"
      extra={<Button type="link" icon={<PlusOutlined />} onClick={handleCreate}>新建</Button>}
    >
      <List size="small" split={false}>
        <List.Item
          onClick={() => onSelect(null)}
          style={{ cursor: 'pointer', background: selectedGroupId === null ? '#f0f0f0' : undefined }}
        >
          全部股票
        </List.Item>
        {groups.map(group => (
          <List.Item
            key={group.id}
            onClick={() => onSelect(group.id)}
            style={{ cursor: 'pointer', background: selectedGroupId === group.id ? '#f0f0f0' : undefined }}
            actions={[
              <Dropdown menu={{ items: getMenuItems(group) }} trigger={['click']}>
                <MoreOutlined onClick={e => e.stopPropagation()} />
              </Dropdown>
            ]}
          >
            <Space>
              <Tag color={group.color}>{group.name}</Tag>
              <span style={{ color: '#999' }}>{group._count.watchlists}</span>
            </Space>
          </List.Item>
        ))}
      </List>

      <Modal title={editingGroup ? '编辑分组' : '新建分组'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="分组名称" rules={[{ required: true }]}>
            <Input placeholder="请输入分组名称" />
          </Form.Item>
          <Form.Item name="color" label="颜色" initialValue="#1890FF">
            <Input type="color" style={{ width: 60 }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default WatchlistGroupPanel;
