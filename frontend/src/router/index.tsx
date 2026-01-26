import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout, ProtectedRoute } from '@/components'
import { Home, Login, Register, DiaryList, TodaySummary, TomorrowPlan, HistoryPage, StatisticsPage, TagManagement, SearchPage, DataExport, UserSettings } from '@/pages'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Home />,
          },
          {
            path: '/diary',
            element: <DiaryList />,
          },
          {
            path: '/diary/today',
            element: <TodaySummary />,
          },
          {
            path: '/diary/plan',
            element: <TomorrowPlan />,
          },
          {
            path: '/history',
            element: <HistoryPage />,
          },
          {
            path: '/statistics',
            element: <StatisticsPage />,
          },
          {
            path: '/settings/tags',
            element: <TagManagement />,
          },
          {
            path: '/settings/export',
            element: <DataExport />,
          },
          {
            path: '/settings/user',
            element: <UserSettings />,
          },
          {
            path: '/search',
            element: <SearchPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default router
