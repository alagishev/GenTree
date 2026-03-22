import type { ProjectFileActions } from '../hooks/useProjectFileActions'
import { useGraphStore } from '../store/graphStore'

export function AppToolbar({
  file,
  onOpenPersonEditor,
  onOpenEdgeEditor,
  onOpenAiAssistant,
}: {
  file: ProjectFileActions
  onOpenPersonEditor: (nodeId: string) => void
  onOpenEdgeEditor: (edgeId: string) => void
  onOpenAiAssistant: () => void
}) {
  const dirty = useGraphStore((s) => s.dirty)
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId)

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur-sm">
      <span className="mr-2 self-center text-sm font-semibold text-slate-800">GenTree</span>
      <button
        type="button"
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        onClick={() => void file.doNew()}
      >
        New
      </button>
      <button
        type="button"
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        onClick={() => void file.doOpen()}
      >
        Open…
      </button>
      <button
        type="button"
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        onClick={() => void file.doSave()}
      >
        Save
      </button>
      <button
        type="button"
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        onClick={() => void file.doSaveAs()}
      >
        Save as…
      </button>
      <button
        type="button"
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        onClick={file.fitAll}
      >
        Fit all
      </button>
      <button
        type="button"
        disabled={!selectedNodeId}
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        onClick={() => selectedNodeId && onOpenPersonEditor(selectedNodeId)}
      >
        Edit person
      </button>
      <button
        type="button"
        disabled={!selectedEdgeId}
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        onClick={() => selectedEdgeId && onOpenEdgeEditor(selectedEdgeId)}
      >
        Edit relation
      </button>
      <button
        type="button"
        disabled={file.exporting}
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        onClick={() => void file.doExportPng()}
      >
        Export PNG
      </button>
      <button
        type="button"
        disabled={file.exporting}
        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        onClick={() => void file.doExportSvg()}
      >
        Export SVG
      </button>
      <button
        type="button"
        className="rounded border border-violet-300 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
        onClick={onOpenAiAssistant}
      >
        ✨ AI
      </button>
      {dirty ? (
        <span className="self-center text-xs text-amber-700">● Unsaved</span>
      ) : (
        <span className="self-center text-xs text-slate-400">Saved</span>
      )}
    </div>
  )
}
