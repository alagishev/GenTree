import { useEffect, useRef, useState } from 'react'
import { callAiAssistant } from '../lib/aiService'
import { useGraphStore } from '../store/graphStore'

type Mode = 'new' | 'supplement'

export function AiAssistantModal({
  apiKey,
  onApiKeyChange,
  onClose,
}: {
  apiKey: string
  onApiKeyChange: (key: string) => void
  onClose: () => void
}) {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const loadProject = useGraphStore((s) => s.loadProject)
  const rowHeight = useGraphStore((s) => s.rowHeight)
  const pushUndoSnapshot = useGraphStore((s) => s.pushUndoSnapshot)

  const [mode, setMode] = useState<Mode>('new')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const onGenerate = async () => {
    if (!apiKey.trim()) {
      setError('OpenAI API key is required.')
      return
    }
    if (!message.trim()) {
      setError('Please describe your family.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const result = await callAiAssistant({
        apiKey: apiKey.trim(),
        userMessage: message.trim(),
        existingNodes: nodes,
        existingEdges: edges,
        mode,
      })

      if (mode === 'new') {
        loadProject({
          rowHeight,
          viewport: { x: 0, y: 0, zoom: 1 },
          nodes: result.nodes,
          edges: result.edges,
        })
      } else {
        pushUndoSnapshot()
        const existingIds = new Set(nodes.map((n) => n.id))
        const mergedNodes = [
          ...nodes,
          ...result.nodes.filter((n) => !existingIds.has(n.id)),
        ]
        const existingEdgePairs = new Set(edges.map((e) => `${e.source}→${e.target}`))
        const mergedEdges = [
          ...edges,
          ...result.edges.filter((e) => !existingEdgePairs.has(`${e.source}→${e.target}`)),
        ]
        useGraphStore.setState({ nodes: mergedNodes, edges: mergedEdges, dirty: true })
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const hasExistingGraph = nodes.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onBackdrop}
      role="presentation"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-xl bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 id="ai-assistant-title" className="text-lg font-semibold text-slate-900">
              AI Assistant
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Describe your family in plain language — the AI will build a family tree from your
            text. For example:{' '}
            <span className="italic text-slate-500">
              «I'm John, my mother is Mary, my father is George. My brother Peter was born in
              1985. My paternal grandmother is Vasilisa.»
            </span>
          </p>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6">
          {/* API key */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              OpenAI API key
              <input
                type="password"
                placeholder="sk-..."
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                autoComplete="off"
              />
            </label>
            <p className="mt-1 text-xs text-slate-400">
              🔒 The key is used only for this request and is never stored.
            </p>
          </div>

          {/* Mode toggle */}
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">Mode</div>
            <div className="flex overflow-hidden rounded-lg border border-slate-200">
              <ModeButton
                active={mode === 'new'}
                onClick={() => setMode('new')}
                label="Create new graph"
                description="Replace everything with AI-generated tree"
              />
              <ModeButton
                active={mode === 'supplement'}
                onClick={() => setMode('supplement')}
                label="Add to existing graph"
                description="Extend the current graph with new people"
                disabled={!hasExistingGraph}
                disabledHint="No graph to extend yet"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                ref={textareaRef}
                rows={6}
                placeholder="Describe your family here…"
                className="mt-1 w-full resize-y rounded border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
          </div>

          {/* Error */}
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            onClick={() => void onGenerate()}
            disabled={loading || !apiKey.trim() || !message.trim()}
          >
            {loading ? (
              <>
                <Spinner />
                Generating…
              </>
            ) : (
              <>✨ Generate</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  label,
  description,
  disabled,
  disabledHint,
}: {
  active: boolean
  onClick: () => void
  label: string
  description: string
  disabled?: boolean
  disabledHint?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={disabled ? disabledHint : undefined}
      className={[
        'flex flex-1 flex-col items-start px-4 py-3 text-left text-sm transition-colors',
        active
          ? 'bg-violet-600 text-white'
          : disabled
            ? 'cursor-not-allowed bg-slate-50 text-slate-400'
            : 'bg-white text-slate-700 hover:bg-slate-50',
      ].join(' ')}
    >
      <span className="font-medium">{label}</span>
      <span className={`text-xs ${active ? 'text-violet-200' : 'text-slate-400'}`}>
        {description}
      </span>
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

