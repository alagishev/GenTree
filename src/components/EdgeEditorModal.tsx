import { useEffect, useMemo, useState } from 'react'
import { useGraphStore } from '../store/graphStore'
import type { RelationEdgeData } from '../types/graph'

const STYLES: RelationEdgeData['style'][] = ['solid', 'dashed', 'dotted', 'faded']

export function EdgeEditorModal({
  edgeId,
  onClose,
}: {
  edgeId: string
  onClose: () => void
}) {
  const edge = useGraphStore((s) => s.edges.find((e) => e.id === edgeId))
  const updateEdgeData = useGraphStore((s) => s.updateEdgeData)
  const initial = useMemo(() => edge?.data, [edge])

  const [label, setLabel] = useState('')
  const [style, setStyle] = useState<RelationEdgeData['style']>('solid')
  const [arrowAtSource, setArrowAtSource] = useState(false)
  const [arrowAtTarget, setArrowAtTarget] = useState(false)

  useEffect(() => {
    if (!initial) return
    setLabel(initial.label ?? '')
    setStyle(initial.style ?? 'solid')
    setArrowAtSource(initial.arrowAtSource === true)
    setArrowAtTarget(initial.arrowAtTarget === true)
  }, [initial, edgeId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!edge || !initial) return null

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const onSave = () => {
    updateEdgeData(edgeId, {
      label: label.trim(),
      style,
      arrowAtSource,
      arrowAtTarget,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onBackdrop}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edge-editor-title"
      >
        <h2 id="edge-editor-title" className="text-lg font-semibold text-slate-900">
          Relation
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <label className="block text-sm font-medium text-slate-700">
            Label
            <input
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Line style</legend>
            <div className="mt-2 flex flex-col gap-2">
              {STYLES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name="edge-style"
                    checked={style === s}
                    onChange={() => setStyle(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Arrows</legend>
            <div className="mt-2 flex flex-col gap-2 text-sm text-slate-800">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={arrowAtSource}
                  onChange={(e) => setArrowAtSource(e.target.checked)}
                />
                At source (start of line)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={arrowAtTarget}
                  onChange={(e) => setArrowAtTarget(e.target.checked)}
                />
                At target (end of line)
              </label>
            </div>
          </fieldset>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
