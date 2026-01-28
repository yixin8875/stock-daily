import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout, ProtectedRoute } from '@/components'
import { Home, Login, Register, DiaryList, TodaySummary, TomorrowPlan, HistoryPage, StatisticsPage, TagManagement, SearchPage, DataExport, UserSettings, ReportPage, ReviewPage, AIAnalysisPage, AccountsPage, StockQuotesPage, TradeCalendarPage, NewsPage, BacktestPage, CustomDashboard, ProfitCurvePage, TradeReviewPage, AnalysisReportPage, PositionPage, PositionCalculator, PositionAnalysisPage, AlertPage, WatchlistPage, EarningsPage, SignalPage, MarketPage, ToolsPage, TradingJournalPage } from '@/pages'

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
            path: '/dashboard',
            element: <CustomDashboard />,
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
            path: '/calendar',
            element: <TradeCalendarPage />,
          },
          {
            path: '/statistics',
            element: <StatisticsPage />,
          },
          {
            path: '/reports',
            element: <ReportPage />,
          },
          {
            path: '/review',
            element: <ReviewPage />,
          },
          {
            path: '/backtest',
            element: <BacktestPage />,
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
          {
            path: '/analysis',
            element: <AIAnalysisPage />,
          },
          {
            path: '/settings/accounts',
            element: <AccountsPage />,
          },
          {
            path: '/quotes',
            element: <StockQuotesPage />,
          },
          {
            path: '/news',
            element: <NewsPage />,
          },
          {
            path: '/positions',
            element: <PositionPage />,
          },
          {
            path: '/positions/calculator',
            element: <PositionCalculator />,
          },
          {
            path: '/positions/analysis',
            element: <PositionAnalysisPage />,
          },
          {
            path: '/alerts',
            element: <AlertPage />,
          },
          {
            path: '/profit-curve',
            element: <ProfitCurvePage />,
          },
          {
            path: '/trade-review',
            element: <TradeReviewPage />,
          },
          {
            path: '/analysis-report',
            element: <AnalysisReportPage />,
          },
          {
            path: '/watchlist',
            element: <WatchlistPage />,
          },
          {
            path: '/earnings',
            element: <EarningsPage />,
          },
          {
            path: '/signals',
            element: <SignalPage />,
          },
          {
            path: '/market',
            element: <MarketPage />,
          },
          {
            path: '/tools',
            element: <ToolsPage />,
          },
          {
            path: '/journal',
            element: <TradingJournalPage />,
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
