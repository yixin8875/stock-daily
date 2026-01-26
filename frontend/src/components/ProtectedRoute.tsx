import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores'

interface ProtectedRouteProps {
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectTo = '/login',
}) => {
  const { isAuthenticated, token } = useAuthStore()

  if (!isAuthenticated && !token) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
