import { ROW_HEIGHT } from '../constants/layout'
import type { PersonRFNode, RelationRFEdge } from '../store/graphStore'
import type { PersonNodeData, RelationEdgeData } from '../types/graph'

interface AiNode {
  id: string
  name: string
  birthYear?: number
  generation?: number
}

interface AiEdge {
  source: string
  target: string
  label?: string
}

interface AiGraphResponse {
  nodes: AiNode[]
  edges: AiEdge[]
}

const SYSTEM_PROMPT = `You are a family tree assistant. Extract people and their relationships from the user's description and output a JSON family graph.

Output ONLY valid JSON in this exact format, no markdown, no explanations:
{
  "nodes": [
    {
      "id": "unique_snake_case_id",
      "name": "Full Name",
      "birthYear": 1950,
      "generation": 0
    }
  ],
  "edges": [
    {
      "source": "node_id",
      "target": "node_id",
      "label": "relationship"
    }
  ]
}

Rules:
- "id": unique, lowercase with underscores only (e.g. "john_doe", "grandma_vasilisa")
- "generation": 0 = the narrator/main subject; +1 = their parents; +2 = grandparents; -1 = children; etc. Spouses are same generation as their partner.
- "birthYear": include only if explicitly mentioned (4-digit number); omit the field otherwise
- "label": short relationship in the same language as the user's message (e.g. "отец", "мать", "брат", "жена")
- Extract ALL people mentioned and ALL relationships between them
- Each relationship should produce one edge; direction is from "child/relative" to "parent/relative"
- Output ONLY the JSON object`

function buildSupplementContext(nodes: PersonRFNode[], edges: RelationRFEdge[]): string {
  if (nodes.length === 0) return ''

  const nodeLines = nodes.map((n) => `  - id: "${n.id}", name: "${n.data.name}"`)

  const edgeLines = edges.map((e) => {
    const lbl = e.data?.label ? `, label: "${e.data.label}"` : ''
    return `  - source: "${e.source}", target: "${e.target}"${lbl}`
  })

  return (
    `\n\nCURRENT GRAPH — keep these node IDs EXACTLY, do not rename or remove them:\n` +
    `Nodes:\n${nodeLines.join('\n')}\n` +
    `Edges:\n${edgeLines.join('\n')}\n\n` +
    `Output the COMPLETE updated graph: all existing nodes (with their exact IDs) plus any new people from the description below.`
  )
}

function parseAiResponse(text: string): AiGraphResponse {
  let jsonStr = text.trim()

  const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) jsonStr = codeBlock[1]!.trim()

  const parsed = JSON.parse(jsonStr) as unknown

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).nodes) ||
    !Array.isArray((parsed as Record<string, unknown>).edges)
  ) {
    throw new Error('Unexpected response structure from AI')
  }

  return parsed as AiGraphResponse
}

const NODE_WIDTH = 170
const NODE_GAP = 60

function computeLayout(
  aiNodes: AiNode[],
  existingNodes: PersonRFNode[],
): Record<string, { x: number; y: number }> {
  const rowSpacing = ROW_HEIGHT * 2.5
  const existingPos = new Map(existingNodes.map((n) => [n.id, n.position]))
  const positions: Record<string, { x: number; y: number }> = {}

  for (const n of aiNodes) {
    if (existingPos.has(n.id)) {
      positions[n.id] = existingPos.get(n.id)!
    }
  }

  const newNodes = aiNodes.filter((n) => !existingPos.has(n.id))
  if (newNodes.length === 0) return positions

  const byGen = new Map<number, AiNode[]>()
  for (const n of newNodes) {
    const gen = n.generation ?? 0
    if (!byGen.has(gen)) byGen.set(gen, [])
    byGen.get(gen)!.push(n)
  }

  for (const [gen, genNodes] of byGen) {
    const totalWidth = genNodes.length * NODE_WIDTH + (genNodes.length - 1) * NODE_GAP
    const startX = -(totalWidth / 2)
    const y = -gen * rowSpacing

    genNodes.forEach((node, i) => {
      positions[node.id] = { x: startX + i * (NODE_WIDTH + NODE_GAP), y }
    })
  }

  return positions
}

function buildRFGraph(
  aiGraph: AiGraphResponse,
  existingNodes: PersonRFNode[],
  isNewMode: boolean,
): { nodes: PersonRFNode[]; edges: RelationRFEdge[] } {
  const positions = computeLayout(aiGraph.nodes, isNewMode ? [] : existingNodes)
  const existingMap = new Map(existingNodes.map((n) => [n.id, n]))

  const nodes: PersonRFNode[] = aiGraph.nodes.map((n) => {
    const existing = existingMap.get(n.id)
    const pos = positions[n.id] ?? { x: 0, y: 0 }

    let birthDate: string | undefined
    if (n.birthYear && n.birthYear > 999) {
      birthDate = `${n.birthYear}-01-01`
    }

    const data: PersonNodeData = {
      name: n.name,
      birthDate: birthDate ?? existing?.data.birthDate,
      comment: existing?.data.comment,
      photo: existing?.data.photo,
      customFields: existing?.data.customFields ?? {},
    }

    return { id: n.id, type: 'person' as const, position: pos, data }
  })

  const nodeIds = new Set(nodes.map((n) => n.id))

  const edges: RelationRFEdge[] = aiGraph.edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => {
      const data: RelationEdgeData = {
        label: e.label ?? '',
        style: 'solid',
        arrowAtSource: false,
        arrowAtTarget: true,
      }
      return {
        id: crypto.randomUUID(),
        type: 'relation',
        source: e.source,
        target: e.target,
        data,
      }
    })

  return { nodes, edges }
}

export async function callAiAssistant(params: {
  apiKey: string
  userMessage: string
  existingNodes: PersonRFNode[]
  existingEdges: RelationRFEdge[]
  mode: 'new' | 'supplement'
}): Promise<{ nodes: PersonRFNode[]; edges: RelationRFEdge[] }> {
  const { apiKey, userMessage, existingNodes, existingEdges, mode } = params

  const context = mode === 'supplement' ? buildSupplementContext(existingNodes, existingEdges) : ''
  const fullMessage = userMessage + context

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: fullMessage },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {
      error?: { message?: string }
    }
    throw new Error(err.error?.message ?? `OpenAI API error ${response.status}`)
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string | null } }>
  }

  const content = data.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from AI')

  const aiGraph = parseAiResponse(content)
  return buildRFGraph(aiGraph, existingNodes, mode === 'new')
}
