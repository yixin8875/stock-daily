import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, theme, Tooltip, Drawer, Grid } from 'antd'
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
        key: '/settings/user',
        icon: <UserOutlined />,
        label: '用户设置',
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
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // 判断是否为移动端
  const isMobile = !screens.md

  // 移动端时关闭抽屉
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

  // 菜单内容
  const menuContent = (
    <>
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
        {collapsed && !isMobile ? 'SD' : 'Stock Daily'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={isMobile ? ['diary', 'settings'] : []}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider trigger={null} collapsible collapsed={collapsed}>
          {menuContent}
        </Sider>
      )}

      {/* 移动端抽屉菜单 */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={250}
          styles={{
            body: { padding: 0, background: '#001529' },
            header: { display: 'none' },
          }}
        >
          {menuContent}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            padding: isMobile ? '0 12px' : '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: isMobile ? 'sticky' : 'relative',
            top: 0,
            zIndex: 100,
          }}
        >
          {/* 左侧按钮 */}
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ fontSize: '16px', width: 48, height: 48 }}
            />
          ) : (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
          )}

          {/* 右侧操作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
            {!isMobile && (
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => navigate('/search')}
                style={{ fontSize: '16px' }}
              >
                搜索
              </Button>
            )}
            {isMobile && (
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => navigate('/search')}
                style={{ fontSize: '16px' }}
              />
            )}
            <Tooltip title={mode === 'light' ? '切换深色模式' : '切换浅色模式'}>
              <Button
                type="text"
                icon={mode === 'light' ? <MoonOutlined /> : <SunOutlined />}
                onClick={toggleMode}
                style={{ fontSize: '16px' }}
              />
            </Tooltip>
            {!isMobile && <span>{user?.username || '用户'}</span>}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              {!isMobile && '退出'}
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: isMobile ? '12px 8px' : '24px 16px',
            padding: isMobile ? 12 : 24,
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
