import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, theme, Tooltip, Drawer, Grid, Avatar, Dropdown, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  EditOutlined,
  HistoryOutlined,
  BarChartOutlined,
  LogoutOutlined,
  FormOutlined,
  ScheduleOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  TagsOutlined,
  SearchOutlined,
  ExportOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  StockOutlined,
  FileTextOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  BankOutlined,
} from '@ant-design/icons'
import { useAuthStore, useThemeStore } from '@/stores'

const { Header, Sider, Content } = Layout
const { useBreakpoint } = Grid

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: '/quotes',
    icon: <StockOutlined />,
    label: '股票行情',
  },
  {
    key: '/search',
    icon: <SearchOutlined />,
    label: '搜索',
  },
  {
    key: 'diary',
    icon: <EditOutlined />,
    label: '交易日记',
    children: [
      {
        key: '/diary',
        icon: <UnorderedListOutlined />,
        label: '日记列表',
      },
      {
        key: '/diary/today',
        icon: <FormOutlined />,
        label: '今日总结',
      },
      {
        key: '/diary/plan',
        icon: <ScheduleOutlined />,
        label: '明日计划',
      },
    ],
  },
  {
    key: '/history',
    icon: <HistoryOutlined />,
    label: '历史回顾',
  },
  {
    key: '/statistics',
    icon: <BarChartOutlined />,
    label: '统计分析',
  },
  {
    key: '/reports',
    icon: <FileTextOutlined />,
    label: '交易报告',
  },
  {
    key: '/review',
    icon: <SyncOutlined />,
    label: '交易复盘',
  },
  {
    key: '/analysis',
    icon: <ThunderboltOutlined />,
    label: 'AI分析',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置',
    children: [
      {
        key: '/settings/user',
        icon: <UserOutlined />,
        label: '用户设置',
      },
      {
        key: '/settings/accounts',
        icon: <BankOutlined />,
        label: '账户管理',
      },
      {
        key: '/settings/tags',
        icon: <TagsOutlined />,
        label: '标签管理',
      },
      {
        key: '/settings/export',
        icon: <ExportOutlined />,
        label: '数据导出',
      },
    ],
  },
]

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { clearAuth, user } = useAuthStore()
  const { mode, toggleMode } = useThemeStore()
  const screens = useBreakpoint()
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout, colorPrimary },
  } = theme.useToken()

  const isMobile = !screens.md

  useEffect(() => {
    if (!isMobile) {
      setDrawerVisible(false)
    }
  }, [isMobile])

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
    if (isMobile) {
      setDrawerVisible(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
      onClick: () => navigate('/settings/user'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  // Logo 组件
  const Logo = ({ collapsed: isCollapsed }: { collapsed: boolean }) => (
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        padding: isCollapsed ? '0' : '0 20px',
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${colorPrimary} 0%, #6366F1 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        }}
      >
        <StockOutlined style={{ fontSize: 20, color: '#fff' }} />
      </div>
      {!isCollapsed && (
        <span
          style={{
            marginLeft: 12,
            fontSize: 18,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${colorPrimary} 0%, #6366F1 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          Stock Daily
        </span>
      )}
    </div>
  )

  // 侧边栏样式
  const siderStyle = {
    background: mode === 'dark' ? '#0F172A' : '#FFFFFF',
    borderRight: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
  }

  // 菜单内容
  const menuContent = (
    <>
      <Logo collapsed={collapsed && !isMobile} />
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={isMobile ? ['diary', 'settings'] : []}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          border: 'none',
          background: 'transparent',
          padding: '12px 8px',
        }}
      />
    </>
  )

  return (
    <Layout style={{ minHeight: '100vh', background: colorBgLayout }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          collapsedWidth={80}
          style={siderStyle}
        >
          {menuContent}
        </Sider>
      )}

      {/* 移动端抽屉菜单 */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={280}
          styles={{
            body: { padding: 0, background: mode === 'dark' ? '#0F172A' : '#FFFFFF' },
            header: { display: 'none' },
          }}
        >
          {menuContent}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            padding: isMobile ? '0 16px' : '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
            height: 64,
          }}
        >
          {/* 左侧 */}
          <Space>
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: 18 }}
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: 18 }}
              />
            )}
          </Space>

          {/* 右侧操作区 */}
          <Space size={isMobile ? 8 : 16}>
            {!isMobile && (
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => navigate('/search')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  height: 36,
                  borderRadius: 8,
                  background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                }}
              >
                <span style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}>搜索...</span>
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                    color: mode === 'dark' ? '#94A3B8' : '#64748B',
                  }}
                >
                  ⌘K
                </span>
              </Button>
            )}
            {isMobile && (
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => navigate('/search')}
                style={{ fontSize: 18 }}
              />
            )}

            <Tooltip title={mode === 'light' ? '深色模式' : '浅色模式'}>
              <Button
                type="text"
                icon={mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
                onClick={toggleMode}
                style={{
                  fontSize: 18,
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                }}
              />
            </Tooltip>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                  transition: 'background 0.2s',
                }}
              >
                <Avatar
                  size={36}
                  style={{
                    background: `linear-gradient(135deg, ${colorPrimary} 0%, #6366F1 100%)`,
                    fontWeight: 600,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                {!isMobile && (
                  <span style={{ fontWeight: 500 }}>{user?.username || '用户'}</span>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
