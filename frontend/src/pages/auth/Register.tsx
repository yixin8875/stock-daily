import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Typography, message, theme, Steps } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, StockOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useAuthStore, useThemeStore } from '@/stores'
import { authService } from '@/services'
import type { RegisterParams } from '@/types'

const { Title, Text } = Typography

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { mode } = useThemeStore()
  const {
    token: { colorPrimary, colorBgContainer, borderRadius },
  } = theme.useToken()

  const onFinish = async (values: RegisterParams) => {
    setLoading(true)
    try {
      const response = await authService.register(values)
      const { token, user } = response.data.data
      setAuth(token, user)
      message.success('注册成功')
      navigate('/')
    } catch {
      message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    '记录每日交易操作',
    '追踪投资组合表现',
    '分析交易策略效果',
    '复盘历史交易决策',
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
          : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)',
      }}
    >
      {/* 左侧品牌区域 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
          background: `linear-gradient(135deg, #6366F1 0%, ${colorPrimary} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
        className="register-brand-section"
      >
        {/* 装饰性背景 */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <StockOutlined style={{ fontSize: 40, color: '#fff' }} />
        </div>

        <Title level={2} style={{ color: '#fff', marginBottom: 8, textAlign: 'center' }}>
          开始您的交易之旅
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 48, textAlign: 'center' }}>
          加入 Stock Daily，成为更好的交易者
        </Text>

        {/* 功能列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 300 }}>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                backdropFilter: 'blur(10px)',
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 18, color: '#34D399' }} />
              <span style={{ color: '#fff', fontSize: 15 }}>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧注册表单 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            padding: 40,
            background: colorBgContainer,
            borderRadius: borderRadius * 2,
            boxShadow: mode === 'dark'
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {/* 移动端Logo */}
          <div
            className="mobile-logo"
            style={{
              display: 'none',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${colorPrimary} 0%, #6366F1 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <StockOutlined style={{ fontSize: 28, color: '#fff' }} />
            </div>
            <Title level={3} style={{ margin: 0 }}>Stock Daily</Title>
          </div>

          <Title level={2} style={{ marginBottom: 8 }}>
            创建账户
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
            填写以下信息完成注册
          </Text>

          {/* 注册步骤指示 */}
          <Steps
            size="small"
            current={0}
            items={[
              { title: '填写信息' },
              { title: '验证邮箱' },
              { title: '开始使用' },
            ]}
            style={{ marginBottom: 32 }}
          />

          <Form name="register" onFinish={onFinish} autoComplete="off" size="large" layout="vertical">
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                placeholder="您的昵称"
                style={{ height: 48 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#94A3B8' }} />}
                placeholder="your@email.com"
                style={{ height: 48 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                placeholder="至少6个字符"
                style={{ height: 48 }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                placeholder="再次输入密码"
                style={{ height: 48 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  background: `linear-gradient(135deg, #6366F1 0%, ${colorPrimary} 100%)`,
                  border: 'none',
                }}
              >
                注册
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">已有账号？</Text>{' '}
              <Link to="/login" style={{ fontWeight: 500 }}>立即登录</Link>
            </div>
          </Form>
        </div>
      </div>

      {/* 响应式样式 */}
      <style>{`
        @media (max-width: 768px) {
          .register-brand-section {
            display: none !important;
          }
          .mobile-logo {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Register
