import { useEffect, useState } from 'react'
import { Button, notification } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

// 检查是否支持 Service Worker
const isServiceWorkerSupported = 'serviceWorker' in navigator

const PWAUpdatePrompt: React.FC = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [showReload, setShowReload] = useState(false)

  useEffect(() => {
    if (!isServiceWorkerSupported) return

    // 监听 Service Worker 更新
    const handleServiceWorkerUpdate = () => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker)
                setShowReload(true)
              }
            })
          }
        })
      })
    }

    handleServiceWorkerUpdate()

    // 监听控制器变化
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  }, [])

  useEffect(() => {
    if (showReload) {
      notification.info({
        message: '发现新版本',
        description: '应用有新版本可用，点击刷新按钮更新。',
        btn: (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              if (waitingWorker) {
                waitingWorker.postMessage({ type: 'SKIP_WAITING' })
              }
              notification.destroy()
            }}
          >
            立即刷新
          </Button>
        ),
        duration: 0,
        placement: 'bottomRight',
      })
    }
  }, [showReload, waitingWorker])

  return null
}

export default PWAUpdatePrompt
