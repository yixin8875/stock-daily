import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import router from './router'
import { useThemeStore } from './stores'
import { PWAUpdatePrompt, OfflineIndicator } from './components'

// 专业金融风格主题配置
const financeTheme = {
  light: {
    colorPrimary: '#3B82F6', // 专业蓝
    colorSuccess: '#10B981', // 盈利绿
    colorError: '#EF4444', // 亏损红
    colorWarning: '#F59E0B', // 警告橙
    colorInfo: '#6366F1', // 信息紫
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F8FAFC',
    colorBgElevated: '#FFFFFF',
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',
    colorText: '#0F172A',
    colorTextSecondary: '#64748B',
    colorTextTertiary: '#94A3B8',
    borderRadius: 12,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  dark: {
    colorPrimary: '#60A5FA', // 亮蓝
    colorSuccess: '#34D399', // 盈利绿
    colorError: '#F87171', // 亏损红
    colorWarning: '#FBBF24', // 警告橙
    colorInfo: '#818CF8', // 信息紫
    colorBgContainer: '#1E293B',
    colorBgLayout: '#0F172A',
    colorBgElevated: '#334155',
    colorBorder: '#334155',
    colorBorderSecondary: '#1E293B',
    colorText: '#F8FAFC',
    colorTextSecondary: '#94A3B8',
    colorTextTertiary: '#64748B',
    borderRadius: 12,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
    boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
  },
}

const App: React.FC = () => {
  const { mode } = useThemeStore()
  const currentTheme = financeTheme[mode]

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: currentTheme.colorPrimary,
          colorSuccess: currentTheme.colorSuccess,
          colorError: currentTheme.colorError,
          colorWarning: currentTheme.colorWarning,
          colorInfo: currentTheme.colorInfo,
          colorBgContainer: currentTheme.colorBgContainer,
          colorBgLayout: currentTheme.colorBgLayout,
          colorBgElevated: currentTheme.colorBgElevated,
          colorBorder: currentTheme.colorBorder,
          colorBorderSecondary: currentTheme.colorBorderSecondary,
          colorText: currentTheme.colorText,
          colorTextSecondary: currentTheme.colorTextSecondary,
          colorTextTertiary: currentTheme.colorTextTertiary,
          borderRadius: currentTheme.borderRadius,
          boxShadow: currentTheme.boxShadow,
          boxShadowSecondary: currentTheme.boxShadowSecondary,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Card: {
            borderRadiusLG: 16,
            paddingLG: 24,
          },
          Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontWeight: 500,
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Table: {
            borderRadius: 12,
            headerBg: mode === 'dark' ? '#1E293B' : '#F8FAFC',
          },
          Menu: {
            itemBorderRadius: 8,
            subMenuItemBorderRadius: 8,
          },
          Statistic: {
            contentFontSize: 28,
            titleFontSize: 14,
          },
        },
      }}
    >
      <OfflineIndicator />
      <RouterProvider router={router} />
      <PWAUpdatePrompt />
    </ConfigProvider>
  )
}

export default App
