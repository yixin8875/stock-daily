import React, { useEffect, useState } from 'react'
import {
  Typography,
  Card,
  Form,
  Input,
  Button,
  message,
  Divider,
  Statistic,
  Row,
  Col,
  Spin,
  Space,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { userService } from '@/services/user'
import type { UserProfile, UserStats } from '@/services/user'

const { Title, Text } = Typography

const UserSettings: React.FC = () => {
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)

  // 获取用户资料和统计
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [profileRes, statsRes] = await Promise.all([
          userService.getProfile(),
          userService.getStats(),
        ])
        setProfile(profileRes.data.data)
        setStats(statsRes.data.data)
        profileForm.setFieldsValue({
          username: profileRes.data.data.username,
          email: profileRes.data.data.email,
        })
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [profileForm])

  // 更新资料
  const handleUpdateProfile = async (values: { username: string }) => {
    setProfileLoading(true)
    try {
      const response = await userService.updateProfile({ username: values.username })
      setProfile(response.data.data)
      message.success('资料更新成功')
    } catch (error) {
      console.error('Failed to update profile:', error)
      message.error('资料更新失败')
    } finally {
      setProfileLoading(false)
    }
  }

  // 修改密码
  const handleChangePassword = async (values: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致')
      return
    }
    setPasswordLoading(true)
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error: unknown) {
      console.error('Failed to change password:', error)
      const err = error as { response?: { data?: { message?: string } } }
      message.error(err.response?.data?.message || '密码修改失败')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        用户设置
      </Title>

      <Row gutter={[24, 24]}>
        {/* 左侧：用户统计 */}
        <Col xs={24} lg={8}>
          <Card title="账户概览">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">
                  <MailOutlined style={{ marginRight: 8 }} />
                  邮箱
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>{profile?.email}</Text>
                </div>
              </div>
              <div>
                <Text type="secondary">
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  注册时间
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>
                    {profile?.createdAt
                      ? dayjs(profile.createdAt).format('YYYY-MM-DD HH:mm')
                      : '-'}
                  </Text>
                </div>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="日记数量"
                    value={stats?.diaryCount || 0}
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="交易记录"
                    value={stats?.tradeCount || 0}
                    prefix={<SwapOutlined />}
                  />
                </Col>
              </Row>
              {stats?.firstDiaryDate && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">首次记录日期</Text>
                  <div>
                    <Text>{dayjs(stats.firstDiaryDate).format('YYYY-MM-DD')}</Text>
                  </div>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* 右侧：设置表单 */}
        <Col xs={24} lg={16}>
          {/* 个人资料 */}
          <Card title="个人资料" style={{ marginBottom: 24 }}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
              style={{ maxWidth: 400 }}
            >
              <Form.Item label="邮箱" name="email">
                <Input
                  prefix={<MailOutlined />}
                  disabled
                  placeholder="邮箱不可修改"
                />
              </Form.Item>
              <Form.Item
                label="用户名"
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, message: '用户名至少2个字符' },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 修改密码 */}
          <Card title="修改密码">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                label="当前密码"
                name="currentPassword"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入当前密码"
                />
              </Form.Item>
              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入新密码"
                />
              </Form.Item>
              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入新密码"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordLoading}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserSettings
