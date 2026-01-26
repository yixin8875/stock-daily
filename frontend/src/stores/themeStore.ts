import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (mode: ThemeMode) => set({ mode }),
      toggleMode: () => {
        const currentMode = get().mode
        set({ mode: currentMode === 'light' ? 'dark' : 'light' })
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
