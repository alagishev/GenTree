import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PersonNodeData } from '../types/graph'

function formatBirthDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('ru-RU')
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

const handleClass =
  '!h-3 !w-3 !border-2 !border-white !bg-slate-400'

/** Four dots; each has target + source at the same spot (source on top) so any dot can start or end a link (with ConnectionMode.Loose). */
export function PersonNode({ data, selected }: NodeProps<PersonNodeData>) {
  const commentPreview =
    data.comment && data.comment.length > 80
      ? `${data.comment.slice(0, 80)}…`
      : data.comment

  return (
    <div
      className={`min-w-[180px] max-w-[240px] rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md transition-shadow ${
        selected ? 'ring-2 ring-sky-500 ring-offset-2' : ''
      }`}
    >
      <Handle
        id="lt-t"
        type="target"
        position={Position.Left}
        style={{ top: '32%' }}
        className={handleClass}
      />
      <Handle
        id="lt-s"
        type="source"
        position={Position.Left}
        style={{ top: '32%' }}
        className={handleClass}
      />
      <Handle
        id="lb-t"
        type="target"
        position={Position.Left}
        style={{ top: '68%' }}
        className={handleClass}
      />
      <Handle
        id="lb-s"
        type="source"
        position={Position.Left}
        style={{ top: '68%' }}
        className={handleClass}
      />
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {data.photo ? (
            <img
              src={data.photo}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
              {initials(data.name)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-slate-900">{data.name}</div>
          {data.birthDate && (
            <div className="text-sm text-slate-600">{formatBirthDate(data.birthDate)}</div>
          )}
          {commentPreview && (
            <div className="mt-1 line-clamp-2 text-xs text-slate-500">{commentPreview}</div>
          )}
        </div>
      </div>
      <Handle
        id="rt-t"
        type="target"
        position={Position.Right}
        style={{ top: '32%' }}
        className={handleClass}
      />
      <Handle
        id="rt-s"
        type="source"
        position={Position.Right}
        style={{ top: '32%' }}
        className={handleClass}
      />
      <Handle
        id="rb-t"
        type="target"
        position={Position.Right}
        style={{ top: '68%' }}
        className={handleClass}
      />
      <Handle
        id="rb-s"
        type="source"
        position={Position.Right}
        style={{ top: '68%' }}
        className={handleClass}
      />
    </div>
  )
}
