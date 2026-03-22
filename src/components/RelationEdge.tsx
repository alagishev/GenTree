import {
  EdgeLabelRenderer,
  getBezierPath,
  useStore,
  type EdgeProps,
} from '@xyflow/react'
import { useMemo } from 'react'
import type { RelationEdgeData } from '../types/graph'

function strokeProps(style: RelationEdgeData['style']): {
  strokeDasharray?: string
  opacity: number
} {
  switch (style) {
    case 'dashed':
      return { strokeDasharray: '8 6', opacity: 1 }
    case 'dotted':
      return { strokeDasharray: '2 4', opacity: 1 }
    case 'faded':
      return { opacity: 0.35 }
    default:
      return { opacity: 1 }
  }
}

function markerSafeId(edgeId: string): string {
  return edgeId.replace(/[^a-zA-Z0-9_-]/g, '_')
}

type EdgeSlice = {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

function fanOffsetForGroup(
  edges: EdgeSlice[],
  edgeId: string,
  key: 'source' | 'target',
  handleKey: 'sourceHandle' | 'targetHandle',
): number {
  const me = edges.find((e) => e.id === edgeId)
  if (!me) return 0
  const h = (me[handleKey] ?? '') as string
  const nodeId = me[key]
  const group = edges.filter((e) => e[key] === nodeId && (e[handleKey] ?? '') === h)
  if (group.length <= 1) return 0
  const ids = group.map((e) => e.id).sort()
  const idx = ids.indexOf(edgeId)
  if (idx < 0) return 0
  const spacing = 14
  return (idx - (ids.length - 1) / 2) * spacing
}

function useIncomingFanTargetOffset(edgeId: string): number {
  const selector = useMemo(
    () => (s: { edges: EdgeSlice[] }) => fanOffsetForGroup(s.edges, edgeId, 'target', 'targetHandle'),
    [edgeId],
  )
  return useStore(selector)
}

function useOutgoingFanSourceOffset(edgeId: string): number {
  const selector = useMemo(
    () => (s: { edges: EdgeSlice[] }) => fanOffsetForGroup(s.edges, edgeId, 'source', 'sourceHandle'),
    [edgeId],
  )
  return useStore(selector)
}

const EDGE_INTERACTION_WIDTH = 20

export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<RelationEdgeData>) {
  const fanSourceY = useOutgoingFanSourceOffset(id)
  const fanTargetY = useIncomingFanTargetOffset(id)
  const styleKind = data?.style ?? 'solid'
  const { strokeDasharray, opacity } = strokeProps(styleKind)
  const stroke = selected ? '#0ea5e9' : '#64748b'
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY: sourceY + fanSourceY,
    sourcePosition,
    targetX,
    targetY: targetY + fanTargetY,
    targetPosition,
  })
  const label = data?.label?.trim()
  const arrowAtSource = data?.arrowAtSource === true
  const arrowAtTarget = data?.arrowAtTarget === true
  const mid = markerSafeId(id)

  const pathStyle = {
    stroke,
    strokeWidth: selected ? 2.5 : 1.75,
    strokeDasharray,
    opacity,
  } as const

  return (
    <>
      {(arrowAtSource || arrowAtTarget) ? (
        <defs>
          {arrowAtTarget && (
            <marker
              id={`gentree-m-end-${mid}`}
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
            </marker>
          )}
          {arrowAtSource && (
            <marker
              id={`gentree-m-start-${mid}`}
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              refX="2"
              refY="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
            </marker>
          )}
        </defs>
      ) : null}
      <path
        id={id}
        d={edgePath}
        fill="none"
        className="react-flow__edge-path"
        markerEnd={arrowAtTarget ? `url(#gentree-m-end-${mid})` : undefined}
        markerStart={arrowAtSource ? `url(#gentree-m-start-${mid})` : undefined}
        style={pathStyle}
      />
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={EDGE_INTERACTION_WIDTH}
        className="react-flow__edge-interaction"
      />
      {label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              fontSize: 11,
              fontWeight: 600,
              color: '#334155',
              background: 'rgba(255,255,255,0.9)',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  )
}
