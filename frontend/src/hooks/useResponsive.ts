import { Grid } from 'antd'

const { useBreakpoint } = Grid

export interface ResponsiveInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screens: ReturnType<typeof useBreakpoint>
}

/**
 * 响应式断点 Hook
 * - isMobile: < 768px (xs, sm)
 * - isTablet: 768px - 1024px (md)
 * - isDesktop: > 1024px (lg, xl, xxl)
 */
export const useResponsive = (): ResponsiveInfo => {
  const screens = useBreakpoint()

  return {
    isMobile: !screens.md,
    isTablet: !!screens.md && !screens.lg,
    isDesktop: !!screens.lg,
    screens,
  }
}

export default useResponsive
