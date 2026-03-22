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

const handleCls = '!h-3 !w-3 !border-2'

/** Four dots; each has target + source at the same spot (source on top) so any dot can start or end a link (with ConnectionMode.Loose). */
export function PersonNode({ data, selected }: NodeProps<PersonNodeData>) {
  const commentPreview =
    data.comment && data.comment.length > 80
      ? `${data.comment.slice(0, 80)}…`
      : data.comment

  const handleStyle = {
    backgroundColor: 'var(--gt-node-handle)',
    borderColor: 'var(--gt-node-handle-border)',
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--gt-node-bg)',
        borderColor: 'var(--gt-node-border)',
        boxShadow: 'var(--gt-node-shadow)',
        outline: selected ? '2px solid var(--gt-node-ring)' : undefined,
        outlineOffset: selected ? '2px' : undefined,
      }}
      className="min-w-[180px] max-w-[240px] rounded-xl border px-3 py-2 transition-shadow"
    >
      <Handle
        id="lt-t"
        type="target"
        position={Position.Left}
        style={{ top: '32%', ...handleStyle }}
        className={handleCls}
      />
      <Handle
        id="lt-s"
        type="source"
        position={Position.Left}
        style={{ top: '32%', ...handleStyle }}
        className={handleCls}
      />
      <Handle
        id="lb-t"
        type="target"
        position={Position.Left}
        style={{ top: '68%', ...handleStyle }}
        className={handleCls}
      />
      <Handle
        id="lb-s"
        type="source"
        position={Position.Left}
        style={{ top: '68%', ...handleStyle }}
        className={handleCls}
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
            <div
              style={{
                backgroundColor: 'var(--gt-node-avatar-bg)',
                color: 'var(--gt-node-avatar-text)',
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
            >
              {initials(data.name)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            style={{ color: 'var(--gt-node-name)' }}
            className="truncate text-base font-semibold"
          >
            {data.name}
          </div>
          {data.birthDate && (
            <div style={{ color: 'var(--gt-node-sub)' }} className="text-sm">
              {formatBirthDate(data.birthDate)}
            </div>
          )}
          {commentPreview && (
            <div
              style={{ color: 'var(--gt-node-muted)' }}
              className="mt-1 line-clamp-2 text-xs"
            >
              {commentPreview}
            </div>
          )}
        </div>
      </div>
      <Handle
        id="rt-t"
        type="target"
        position={Position.Right}
        style={{ top: '32%', ...handleStyle }}
        className={handleCls}
      />
      <Handle
        id="rt-s"
        type="source"
        position={Position.Right}
        style={{ top: '32%', ...handleStyle }}
        className={handleCls}
      />
      <Handle
        id="rb-t"
        type="target"
        position={Position.Right}
        style={{ top: '68%', ...handleStyle }}
        className={handleCls}
      />
      <Handle
        id="rb-s"
        type="source"
        position={Position.Right}
        style={{ top: '68%', ...handleStyle }}
        className={handleCls}
      />
    </div>
  )
}
