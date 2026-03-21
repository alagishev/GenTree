import { useEffect, useMemo, useState } from 'react'
import { EMPTY_NAME_PLACEHOLDER } from '../lib/personData'
import { useGraphStore } from '../store/graphStore'
import type { PersonNodeData } from '../types/graph'

const MAX_PHOTO_BYTES = 2 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

export function PersonEditorModal({
  nodeId,
  onClose,
}: {
  nodeId: string
  onClose: () => void
}) {
  const node = useGraphStore((s) => s.nodes.find((n) => n.id === nodeId))
  const updatePersonData = useGraphStore((s) => s.updatePersonData)

  const initial = useMemo(() => node?.data, [node])

  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState<string | undefined>(undefined)
  const [customRows, setCustomRows] = useState<{ key: string; value: string }[]>([])

  useEffect(() => {
    if (!initial) return
    setName(initial.name)
    setBirthDate(initial.birthDate ?? '')
    setComment(initial.comment ?? '')
    setPhoto(initial.photo)
    setCustomRows(
      Object.entries(initial.customFields).map(([key, value]) => ({ key, value })),
    )
  }, [initial, nodeId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!node || !initial) return null

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const onSave = () => {
    const customFields: Record<string, string> = {}
    for (const row of customRows) {
      const k = row.key.trim()
      if (k) customFields[k] = row.value
    }
    const data: PersonNodeData = {
      name: name.trim() || EMPTY_NAME_PLACEHOLDER,
      comment: comment.trim() || undefined,
      photo,
      customFields,
    }
    const bd = birthDate.trim()
    if (bd !== '') data.birthDate = bd
    updatePersonData(nodeId, data)
    onClose()
  }

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_PHOTO_BYTES) {
      window.alert('File is too large (max ~2 MB).')
      return
    }
    try {
      setPhoto(await readFileAsDataUrl(file))
    } catch {
      window.alert('Could not read the file.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onBackdrop}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-editor-title"
      >
        <h2 id="person-editor-title" className="text-lg font-semibold text-slate-900">
          Person
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Birth date
            <input
              type="date"
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <span className="mt-0.5 block text-xs font-normal text-slate-500">
              Leave empty if unknown
            </span>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Comment
            <textarea
              className="mt-1 min-h-[80px] w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Photo
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
              onChange={onPhoto}
            />
          </label>
          <div>
            <div className="text-sm font-medium text-slate-700">Custom fields</div>
            <div className="mt-2 flex flex-col gap-2">
              {customRows.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="key"
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.key}
                    onChange={(e) => {
                      const next = [...customRows]
                      next[i] = { ...next[i]!, key: e.target.value }
                      setCustomRows(next)
                    }}
                  />
                  <input
                    placeholder="value"
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
                    value={row.value}
                    onChange={(e) => {
                      const next = [...customRows]
                      next[i] = { ...next[i]!, value: e.target.value }
                      setCustomRows(next)
                    }}
                  />
                  <button
                    type="button"
                    className="rounded bg-slate-100 px-2 text-sm text-slate-700 hover:bg-slate-200"
                    onClick={() => setCustomRows(customRows.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="self-start rounded border border-dashed border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
                onClick={() => setCustomRows([...customRows, { key: '', value: '' }])}
              >
                + Add field
              </button>
            </div>
          </div>
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
