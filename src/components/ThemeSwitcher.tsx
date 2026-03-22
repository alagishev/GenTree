import { THEMES } from '../lib/themes'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeSwitcher() {
  const { theme, setThemeId } = useTheme()

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
      <span className="text-xs font-medium text-slate-500">Theme</span>
      <div className="flex gap-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.name}
            onClick={() => setThemeId(t.id)}
            className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
              theme.id === t.id
                ? 'scale-110 border-sky-500 shadow-sm'
                : 'border-slate-300 hover:border-slate-400'
            }`}
            style={{ backgroundColor: t.swatch }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">{theme.name}</span>
    </div>
  )
}
