import { useEffect, useState } from 'react'
import { Alert } from 'antd'
import { DisconnectOutlined } from '@ant-design/icons'

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <Alert
      message={
        <span>
          <DisconnectOutlined style={{ marginRight: 8 }} />
          您当前处于离线状态，部分功能可能不可用
        </span>
      }
      type="warning"
      banner
      showIcon={false}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1001,
        textAlign: 'center',
      }}
    />
  )
}

export default OfflineIndicator
