import { createContext, useContext, useState, type ReactNode } from 'react'
import { DEFAULT_THEME_ID, THEMES, type GraphTheme } from '../lib/themes'

interface ThemeContextValue {
  theme: GraphTheme
  setThemeId: (id: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID)
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0]!

  return (
    <ThemeContext.Provider value={{ theme, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
