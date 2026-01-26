import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, theme } from 'antd'
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
} from '@ant-design/icons'
import { useAuthStore } from '@/stores'

const { Header, Sider, Content } = Layout

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页',
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
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置',
    children: [
      {
        key: '/settings/tags',
        icon: <TagsOutlined />,
        label: '标签管理',
      },
    ],
  },
]

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { clearAuth, user } = useAuthStore()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'SD' : 'Stock Daily'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => navigate('/search')}
              style={{ fontSize: '16px' }}
            >
              {!collapsed && '搜索'}
            </Button>
            <span>{user?.username || '用户'}</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
