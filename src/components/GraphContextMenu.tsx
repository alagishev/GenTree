import { useEffect, useRef } from 'react'

export type GraphContextMenuItem = {
  label: string
  onClick: () => void
  danger?: boolean
}

export function GraphContextMenu({
  x,
  y,
  items,
  onClose,
}: {
  x: number
  y: number
  items: GraphContextMenuItem[]
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = ref.current
      if (el && el.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed z-[90] min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={{ left: x, top: y }}
      role="menu"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
            item.danger ? 'text-red-700 hover:bg-red-50' : 'text-slate-800'
          }`}
          onClick={() => {
            item.onClick()
            onClose()
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
