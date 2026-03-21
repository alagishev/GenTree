/** Birth date as `YYYY-MM-DD` (same as `<input type="date">`). */
export type BirthDateIso = string

export type PersonNodeData = {
  name: string
  birthDate?: BirthDateIso
  comment?: string
  photo?: string
  customFields: Record<string, string>
}

export type RelationEdgeData = {
  label?: string
  style: 'solid' | 'dashed' | 'dotted' | 'faded'
  /** Arrowhead at the source end (start of the line). */
  arrowAtSource?: boolean
  /** Arrowhead at the target end (end of the line). */
  arrowAtTarget?: boolean
}

export type GentreeFileV1 = {
  version: 1
  rowHeight: number
  viewport: { x: number; y: number; zoom: number }
  nodes: SerializedPersonNode[]
  edges: SerializedRelationEdge[]
}

export type SerializedPersonNode = {
  id: string
  type: 'person'
  position: { x: number; y: number }
  data: PersonNodeData
}

export type SerializedRelationEdge = {
  id: string
  type?: string
  source: string
  target: string
  data?: RelationEdgeData
}
