import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Form, Input, Button, Typography, message, theme } from 'antd'
import { MailOutlined, LockOutlined, StockOutlined, LineChartOutlined, RiseOutlined, FundOutlined } from '@ant-design/icons'
import { useAuthStore, useThemeStore } from '@/stores'
import { authService } from '@/services'
import type { LoginParams } from '@/types'

const { Title, Text } = Typography

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { mode } = useThemeStore()
  const {
    token: { colorPrimary, colorBgContainer, borderRadius },
  } = theme.useToken()

  const onFinish = async (values: LoginParams) => {
    setLoading(true)
    try {
      const response = await authService.login(values)
      const { token, user } = response.data.data
      setAuth(token, user)
      message.success('登录成功')
      navigate('/')
    } catch {
      message.error('登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: <LineChartOutlined />, text: '记录每日交易' },
    { icon: <RiseOutlined />, text: '追踪盈亏表现' },
    { icon: <FundOutlined />, text: '分析交易策略' },
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
      {/* 左侧品牌区域 - 仅桌面端显示 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 48,
          background: `linear-gradient(135deg, ${colorPrimary} 0%, #6366F1 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
        className="login-brand-section"
      >
        {/* 装饰性背景图案 */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
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
            left: -150,
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

        <Title level={1} style={{ color: '#fff', marginBottom: 8, textAlign: 'center' }}>
          Stock Daily
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 48, textAlign: 'center' }}>
          专业的股票交易日记工具
        </Text>

        {/* 功能特点 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize: 20, color: '#fff' }}>{feature.icon}</span>
              <span style={{ color: '#fff', fontSize: 16 }}>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧登录表单 */}
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
            欢迎回来
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
            登录您的账户继续使用
          </Text>

          <Form name="login" onFinish={onFinish} autoComplete="off" size="large" layout="vertical">
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
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
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                placeholder="输入密码"
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
                  background: `linear-gradient(135deg, ${colorPrimary} 0%, #6366F1 100%)`,
                  border: 'none',
                }}
              >
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">还没有账号？</Text>{' '}
              <Link to="/register" style={{ fontWeight: 500 }}>立即注册</Link>
            </div>
          </Form>
        </div>
      </div>

      {/* 响应式样式 */}
      <style>{`
        @media (max-width: 768px) {
          .login-brand-section {
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

export default Login
