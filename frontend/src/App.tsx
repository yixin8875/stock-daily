import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import router from './router'
import { useThemeStore } from './stores'
import { PWAUpdatePrompt, OfflineIndicator } from './components'

const App: React.FC = () => {
  const { mode } = useThemeStore()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
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
