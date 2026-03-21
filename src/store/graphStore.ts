import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import { create } from 'zustand'
import { ROW_HEIGHT } from '../constants/layout'
import { DEFAULT_NEW_PERSON_NAME } from '../lib/personData'
import type { PersonNodeData, RelationEdgeData } from '../types/graph'

export type PersonRFNode = Node<PersonNodeData, 'person'>
export type RelationRFEdge = Edge<RelationEdgeData>

const MAX_UNDO = 80

export type GraphUndoSnapshot = {
  nodes: PersonRFNode[]
  edges: RelationRFEdge[]
}

function snapY(y: number, rowHeight: number): number {
  return Math.round(y / rowHeight) * rowHeight
}

function defaultPersonData(): PersonNodeData {
  return {
    name: DEFAULT_NEW_PERSON_NAME,
    customFields: {},
  }
}

function defaultEdgeData(): RelationEdgeData {
  return {
    label: '',
    style: 'solid',
    arrowAtSource: false,
    arrowAtTarget: false,
  }
}

type Viewport = { x: number; y: number; zoom: number }

export interface GraphState {
  rowHeight: number
  viewport: Viewport
  /** Incremented when project is loaded or reset so React Flow can apply `viewport`. */
  loadRevision: number
  dirty: boolean
  nodes: PersonRFNode[]
  edges: RelationRFEdge[]
  selectedNodeId: string | null
  selectedEdgeId: string | null
  currentFilePath: string | null
  past: GraphUndoSnapshot[]

  setViewport: (v: Viewport) => void
  onNodesChange: (changes: NodeChange<PersonRFNode>[]) => void
  onEdgesChange: (changes: EdgeChange<RelationRFEdge>[]) => void
  onConnect: (connection: Connection) => void
  addPersonAt: (position: { x: number; y: number }) => void
  onNodeDragStop: (_: unknown, node: PersonRFNode) => void
  setSelectedNodeId: (id: string | null) => void
  setSelectedEdgeId: (id: string | null) => void
  clearSelection: () => void
  updatePersonData: (id: string, data: PersonNodeData) => void
  updateEdgeData: (id: string, data: RelationEdgeData) => void
  deletePerson: (id: string) => void
  deleteEdge: (id: string) => void
  /** Push current graph state for Ctrl+Z (e.g. at the start of a node drag). */
  pushUndoSnapshot: () => void
  undo: () => void
  loadProject: (payload: {
    rowHeight: number
    viewport: Viewport
    nodes: PersonRFNode[]
    edges: RelationRFEdge[]
  }) => void
  newEmptyGraph: () => void
  markSaved: (path: string | null) => void
  markDirty: () => void
}

function cloneSnapshot(nodes: PersonRFNode[], edges: RelationRFEdge[]): GraphUndoSnapshot {
  return { nodes: structuredClone(nodes), edges: structuredClone(edges) }
}

export const useGraphStore = create<GraphState>((set, get) => {
  const recordUndo = () => {
    const { nodes, edges, past } = get()
    set({
      past: [...past.slice(-(MAX_UNDO - 1)), cloneSnapshot(nodes, edges)],
    })
  }

  return {
    rowHeight: ROW_HEIGHT,
    viewport: { x: 0, y: 0, zoom: 1 },
    loadRevision: 0,
    dirty: false,
    nodes: [],
    edges: [],
    selectedNodeId: null,
    selectedEdgeId: null,
    currentFilePath: null,
    past: [],

    setViewport: (viewport) => set({ viewport }),

    onNodesChange: (changes) => {
      if (changes.some((c) => c.type === 'remove')) {
        recordUndo()
      }
      set({
        nodes: applyNodeChanges(changes, get().nodes),
        dirty: true,
      })
    },

    onEdgesChange: (changes) => {
      if (changes.some((c) => c.type === 'remove')) {
        recordUndo()
      }
      set({
        edges: applyEdgeChanges(changes, get().edges),
        dirty: true,
      })
    },

    onConnect: (connection) => {
      if (connection.source === connection.target) return
      recordUndo()
      const id = crypto.randomUUID()
      const newEdge: RelationRFEdge = {
        id,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: 'relation',
        data: defaultEdgeData(),
      }
      set({
        edges: [...get().edges, newEdge],
        dirty: true,
        selectedEdgeId: id,
      })
    },

    addPersonAt: (position) => {
      recordUndo()
      const { rowHeight } = get()
      const id = crypto.randomUUID()
      const node: PersonRFNode = {
        id,
        type: 'person',
        position: {
          x: position.x,
          y: snapY(position.y, rowHeight),
        },
        data: defaultPersonData(),
      }
      set({
        nodes: [...get().nodes, node],
        dirty: true,
      })
    },

    onNodeDragStop: (_, node) => {
      const { rowHeight } = get()
      const ySnap = snapY(node.position.y, rowHeight)
      set({
        nodes: get().nodes.map((n) =>
          n.id === node.id ? { ...n, position: { ...n.position, y: ySnap } } : n,
        ),
        dirty: true,
      })
    },

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
    setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
    clearSelection: () => set({ selectedNodeId: null, selectedEdgeId: null }),

    updatePersonData: (id, data) => {
      recordUndo()
      set({
        nodes: get().nodes.map((n) => (n.id === id ? { ...n, data } : n)),
        dirty: true,
      })
    },

    updateEdgeData: (id, data) => {
      recordUndo()
      set({
        edges: get().edges.map((e) => (e.id === id ? { ...e, data } : e)),
        dirty: true,
      })
    },

    deletePerson: (id) => {
      recordUndo()
      const { nodes, edges, selectedNodeId, selectedEdgeId } = get()
      const removedEdgeIds = new Set(
        edges.filter((e) => e.source === id || e.target === id).map((e) => e.id),
      )
      set({
        nodes: nodes.filter((n) => n.id !== id),
        edges: edges.filter((e) => e.source !== id && e.target !== id),
        dirty: true,
        selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
        selectedEdgeId:
          selectedEdgeId && removedEdgeIds.has(selectedEdgeId) ? null : selectedEdgeId,
      })
    },

    deleteEdge: (id) => {
      recordUndo()
      const { edges, selectedEdgeId } = get()
      set({
        edges: edges.filter((e) => e.id !== id),
        dirty: true,
        selectedEdgeId: selectedEdgeId === id ? null : selectedEdgeId,
      })
    },

    pushUndoSnapshot: () => {
      recordUndo()
    },

    undo: () => {
      const { past } = get()
      if (past.length === 0) return
      const snap = past[past.length - 1]!
      set({
        nodes: structuredClone(snap.nodes),
        edges: structuredClone(snap.edges),
        past: past.slice(0, -1),
        dirty: true,
        selectedNodeId: null,
        selectedEdgeId: null,
      })
    },

    loadProject: ({ rowHeight, viewport, nodes, edges }) => {
      set({
        rowHeight,
        viewport,
        nodes,
        edges,
        dirty: false,
        selectedNodeId: null,
        selectedEdgeId: null,
        loadRevision: get().loadRevision + 1,
        past: [],
      })
    },

    newEmptyGraph: () => {
      set({
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        dirty: false,
        selectedNodeId: null,
        selectedEdgeId: null,
        currentFilePath: null,
        loadRevision: get().loadRevision + 1,
        past: [],
      })
    },

    markSaved: (path) => set({ dirty: false, currentFilePath: path }),
    markDirty: () => set({ dirty: true }),
  }
})
