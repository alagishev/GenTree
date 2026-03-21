import type { PersonNodeData, RelationEdgeData } from '../types/graph'
import type { PersonRFNode, RelationRFEdge } from '../store/graphStore'

export type LoadedGentree = {
  rowHeight: number
  viewport: { x: number; y: number; zoom: number }
  nodes: PersonRFNode[]
  edges: RelationRFEdge[]
}

export function serializeGentree(payload: LoadedGentree): string {
  const doc = {
    version: 1 as const,
    rowHeight: payload.rowHeight,
    viewport: { ...payload.viewport },
    nodes: payload.nodes.map((n) => ({
      id: n.id,
      type: 'person' as const,
      position: { ...n.position },
      data: { ...n.data, customFields: { ...n.data.customFields } },
    })),
    edges: payload.edges.map((e) => ({
      id: e.id,
      type: 'relation' as const,
      source: e.source,
      target: e.target,
      data: e.data
        ? {
            label: e.data.label,
            style: e.data.style,
            arrowAtSource: e.data.arrowAtSource,
            arrowAtTarget: e.data.arrowAtTarget,
          }
        : {
            label: '',
            style: 'solid' as const,
            arrowAtSource: false,
            arrowAtTarget: false,
          },
    })),
  }
  return `${JSON.stringify(doc, null, 2)}\n`
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

export function parseGentreeJson(raw: string): LoadedGentree {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    throw new Error('File is not valid JSON.')
  }
  if (!isRecord(parsed)) throw new Error('Invalid file structure.')
  if (parsed.version !== 1) throw new Error('Only version: 1 is supported.')
  if (typeof parsed.rowHeight !== 'number') throw new Error('Missing rowHeight.')
  const vp = parsed.viewport
  if (
    !isRecord(vp) ||
    typeof vp.x !== 'number' ||
    typeof vp.y !== 'number' ||
    typeof vp.zoom !== 'number'
  ) {
    throw new Error('Invalid viewport.')
  }
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error('Expected nodes and edges arrays.')
  }

  const nodes: PersonRFNode[] = parsed.nodes.map((n, i) => {
    if (!isRecord(n)) throw new Error(`Node ${i}: invalid format.`)
    if (typeof n.id !== 'string' || n.type !== 'person') throw new Error(`Node ${i}: expected type "person".`)
    const pos = n.position
    if (
      !isRecord(pos) ||
      typeof pos.x !== 'number' ||
      typeof pos.y !== 'number'
    ) {
      throw new Error(`Node ${i}: invalid position.`)
    }
    const d = n.data
    if (!isRecord(d) || typeof d.name !== 'string') {
      throw new Error(`Node ${i}: invalid data.`)
    }
    const customFields: Record<string, string> = {}
    if (d.customFields != null) {
      if (!isRecord(d.customFields)) throw new Error(`Node ${i}: customFields must be an object.`)
      for (const [k, v] of Object.entries(d.customFields)) {
        if (typeof v === 'string') customFields[k] = v
      }
    }
    const data: PersonNodeData = {
      name: d.name,
      customFields,
    }
    if (typeof d.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.birthDate)) {
      data.birthDate = d.birthDate
    } else if (typeof d.birthYear === 'number' && Number.isFinite(d.birthYear)) {
      const y = Math.trunc(d.birthYear)
      data.birthDate = `${y}-01-01`
    }
    if (typeof d.comment === 'string') data.comment = d.comment
    if (typeof d.photo === 'string') data.photo = d.photo
    return {
      id: n.id,
      type: 'person',
      position: { x: pos.x, y: pos.y },
      data,
    }
  })

  const edges: RelationRFEdge[] = parsed.edges.map((e, i) => {
    if (!isRecord(e)) throw new Error(`Edge ${i}: invalid format.`)
    if (typeof e.id !== 'string' || typeof e.source !== 'string' || typeof e.target !== 'string') {
      throw new Error(`Edge ${i}: id, source, and target are required.`)
    }
    const ed = e.data
    let data: RelationEdgeData = {
      label: '',
      style: 'solid',
      arrowAtSource: false,
      arrowAtTarget: false,
    }
    if (ed != null) {
      if (!isRecord(ed)) throw new Error(`Edge ${i}: invalid data.`)
      const style = ed.style
      if (
        style === 'solid' ||
        style === 'dashed' ||
        style === 'dotted' ||
        style === 'faded'
      ) {
        data = {
          label: typeof ed.label === 'string' ? ed.label : '',
          style,
          arrowAtSource: ed.arrowAtSource === true,
          arrowAtTarget: ed.arrowAtTarget === true,
        }
      }
    }
    return {
      id: e.id,
      type: 'relation',
      source: e.source,
      target: e.target,
      data,
    } as RelationRFEdge
  })

  return {
    rowHeight: parsed.rowHeight,
    viewport: { x: vp.x, y: vp.y, zoom: vp.zoom },
    nodes,
    edges,
  }
}
