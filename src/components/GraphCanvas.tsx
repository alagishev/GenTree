import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useProjectFileActions } from '../hooks/useProjectFileActions'
import { isPersonDataVisuallyEmpty } from '../lib/personData'
import { useGraphStore } from '../store/graphStore'
import { AppToolbar } from './AppToolbar'
import { ConfirmModal } from './ConfirmModal'
import { EdgeEditorModal } from './EdgeEditorModal'
import { GraphContextMenu } from './GraphContextMenu'
import { PersonEditorModal } from './PersonEditorModal'
import { PersonNode } from './PersonNode'
import { RelationEdge } from './RelationEdge'

const nodeTypes: NodeTypes = { person: PersonNode }
const edgeTypes: EdgeTypes = { relation: RelationEdge }

function BindFlowInstance({
  onReady,
}: {
  onReady: (i: ReactFlowInstance) => void
}) {
  const rf = useReactFlow()
  useEffect(() => {
    onReady(rf)
  }, [rf, onReady])
  return null
}

type CtxMenu =
  | { kind: 'node'; nodeId: string; x: number; y: number }
  | { kind: 'edge'; edgeId: string; x: number; y: number }

function GraphFlow() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId)
  const loadRevision = useGraphStore((s) => s.loadRevision)
  const onNodesChange = useGraphStore((s) => s.onNodesChange)
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange)
  const onConnect = useGraphStore((s) => s.onConnect)
  const addPersonAt = useGraphStore((s) => s.addPersonAt)
  const onNodeDragStop = useGraphStore((s) => s.onNodeDragStop)
  const setSelectedEdgeId = useGraphStore((s) => s.setSelectedEdgeId)
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId)
  const clearSelection = useGraphStore((s) => s.clearSelection)
  const setViewport = useGraphStore((s) => s.setViewport)
  const markDirty = useGraphStore((s) => s.markDirty)
  const deletePerson = useGraphStore((s) => s.deletePerson)
  const deleteEdge = useGraphStore((s) => s.deleteEdge)
  const pushUndoSnapshot = useGraphStore((s) => s.pushUndoSnapshot)

  const file = useProjectFileActions()
  const [rf, setRf] = useState<ReactFlowInstance | null>(null)
  const [personModalId, setPersonModalId] = useState<string | null>(null)
  const [edgeModalId, setEdgeModalId] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null)
  const [confirmDeletePersonId, setConfirmDeletePersonId] = useState<string | null>(null)

  const edgesForRf = useMemo(
    () => edges.map((e) => ({ ...e, selected: e.id === selectedEdgeId })),
    [edges, selectedEdgeId],
  )

  const onReady = useCallback((instance: ReactFlowInstance) => {
    setRf(instance)
  }, [])

  const flowWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!rf) return
    const v = useGraphStore.getState().viewport
    rf.setViewport(v)
  }, [loadRevision, rf])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      if (e.shiftKey) return
      // Physical Z key (layout-independent: with RU layout `e.key` is often not "z").
      if (e.code !== 'KeyZ') return
      const t = e.target
      if (
        t instanceof HTMLElement &&
        t.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }
      e.preventDefault()
      useGraphStore.getState().undo()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [])

  useEffect(() => {
    if (!rf) return

    let detach: (() => void) | undefined
    let cancelled = false
    let raf2: number | undefined

    const attach = () => {
      const pane = flowWrapRef.current?.querySelector('.react-flow__pane')
      if (!pane) return

      const onDblClick = (e: MouseEvent) => {
        const el = e.target as HTMLElement | null
        if (!el) return
        if (el.closest('.react-flow__node')) return
        if (el.closest('.react-flow__edge')) return
        if (el.closest('.react-flow__panel')) return
        if (el.closest('.react-flow__controls')) return
        e.preventDefault()
        const p = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
        addPersonAt(p)
      }

      pane.addEventListener('dblclick', onDblClick)
      detach = () => pane.removeEventListener('dblclick', onDblClick)
    }

    const raf1 = requestAnimationFrame(() => {
      if (cancelled) return
      raf2 = requestAnimationFrame(() => {
        if (cancelled) return
        attach()
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      if (raf2 !== undefined) cancelAnimationFrame(raf2)
      detach?.()
    }
  }, [rf, addPersonAt])

  useEffect(() => {
    if (!window.gentreeMenu) return
    return window.gentreeMenu.onAction((a) => {
      if (a === 'new') void file.doNew()
      else if (a === 'open') void file.doOpen()
      else if (a === 'save') void file.doSave()
      else if (a === 'saveAs') void file.doSaveAs()
      else if (a === 'exportPng') void file.doExportPng()
      else if (a === 'exportSvg') void file.doExportSvg()
    })
  }, [file])

  const onPaneClick = useCallback(() => {
    setCtxMenu(null)
    clearSelection()
  }, [clearSelection])

  const onPaneContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setCtxMenu(null)
  }, [])

  const requestDeletePerson = useCallback(
    (nodeId: string) => {
      const node = useGraphStore.getState().nodes.find((n) => n.id === nodeId)
      if (!node || node.type !== 'person') return
      if (isPersonDataVisuallyEmpty(node.data)) {
        deletePerson(nodeId)
      } else {
        setConfirmDeletePersonId(nodeId)
      }
    },
    [deletePerson],
  )

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: (typeof edges)[number]) => {
      setSelectedEdgeId(edge.id)
      setSelectedNodeId(null)
    },
    [setSelectedEdgeId, setSelectedNodeId],
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: (typeof nodes)[number]) => {
      setSelectedNodeId(node.id)
      setSelectedEdgeId(null)
    },
    [setSelectedNodeId, setSelectedEdgeId],
  )

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: (typeof nodes)[number]) => {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({ kind: 'node', nodeId: node.id, x: e.clientX, y: e.clientY })
  }, [])

  const onEdgeContextMenu = useCallback((e: React.MouseEvent, edge: (typeof edges)[number]) => {
    e.preventDefault()
    e.stopPropagation()
    setCtxMenu({ kind: 'edge', edgeId: edge.id, x: e.clientX, y: e.clientY })
  }, [])

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: (typeof edges)[number]) => {
      setEdgeModalId(edge.id)
    },
    [],
  )

  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: (typeof nodes)[number]) => {
      if (node.type === 'person') setPersonModalId(node.id)
    },
    [],
  )

  const onNodeDragStart = useCallback(() => {
    pushUndoSnapshot()
  }, [pushUndoSnapshot])

  const isValidConnection = useCallback((c: Connection) => c.source !== c.target, [])

  return (
    <div ref={flowWrapRef} className="h-full w-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edgesForRf}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        zoomOnDoubleClick={false}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeDoubleClick={onEdgeDoubleClick}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        onMoveEnd={(_, vp) => {
          setViewport(vp)
          markDirty()
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-slate-50"
      >
        <BindFlowInstance onReady={onReady} />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls className="!shadow-md" />
        <AppToolbar
          file={file}
          onOpenPersonEditor={(id) => setPersonModalId(id)}
          onOpenEdgeEditor={(id) => setEdgeModalId(id)}
        />
      </ReactFlow>

      {ctxMenu?.kind === 'node' ? (
        <GraphContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          items={[
            {
              label: 'Edit',
              onClick: () => setPersonModalId(ctxMenu.nodeId),
            },
            {
              label: 'Delete',
              danger: true,
              onClick: () => requestDeletePerson(ctxMenu.nodeId),
            },
          ]}
        />
      ) : null}
      {ctxMenu?.kind === 'edge' ? (
        <GraphContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          items={[
            {
              label: 'Edit',
              onClick: () => setEdgeModalId(ctxMenu.edgeId),
            },
            {
              label: 'Delete',
              danger: true,
              onClick: () => deleteEdge(ctxMenu.edgeId),
            },
          ]}
        />
      ) : null}

      {personModalId ? (
        <PersonEditorModal nodeId={personModalId} onClose={() => setPersonModalId(null)} />
      ) : null}
      {edgeModalId ? (
        <EdgeEditorModal edgeId={edgeModalId} onClose={() => setEdgeModalId(null)} />
      ) : null}

      {confirmDeletePersonId ? (
        <ConfirmModal
          title="Delete"
          message="Delete this person? All connected edges will be removed."
          cancelLabel="Cancel"
          confirmLabel="Delete"
          onCancel={() => setConfirmDeletePersonId(null)}
          onConfirm={() => {
            deletePerson(confirmDeletePersonId)
            setConfirmDeletePersonId(null)
          }}
        />
      ) : null}
    </div>
  )
}

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphFlow />
    </ReactFlowProvider>
  )
}
