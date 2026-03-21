# Agent task 02 — Tailwind, React Flow, Zustand, basic canvas

## Prerequisites

Step **01** done: `npm run dev` works.

## Goals

1. Install and configure **Tailwind CSS** for Vite + React (postcss, `tailwind.config`, `index.css` with `@tailwind` directives).
2. Install **React Flow** — use the current package (`@xyflow/react` preferred; if the project already has `reactflow`, do not mix two APIs).
3. Install **Zustand**.
4. Implement **`GraphCanvas`** (or `App` with embedded RF): full-screen canvas with `ReactFlow`, `Background`, `Controls` (zoom/pan as provided).
5. State:
   - Zustand store: `nodes`, `edges` in the shape expected by RF (`Node`, `Edge` types from the package).
   - On startup: **empty** graph or 1–2 test nodes of type `default` — only to verify rendering; custom nodes come in step 03.
6. Wire store to React Flow in **controlled** mode: RF events (`onNodesChange`, `onEdgesChange`, `onConnect`) update the store.

## Data types (seed the store; keep `data` simple for now)

Add types (e.g. in `src/types/graph.ts`):

```ts
export type PersonNodeData = {
  name: string;
  birthDate?: string; // YYYY-MM-DD
  comment?: string;
  photo?: string; // data URL or empty
  customFields: Record<string, string>;
};

export type RelationEdgeData = {
  label?: string;
  style: 'solid' | 'dashed' | 'dotted' | 'faded';
  arrowAtSource?: boolean;
  arrowAtTarget?: boolean;
};
```

RF nodes: `type: 'person'` (register `nodeTypes` — until step 03 you may map to default or a temporary component).

## Constraints

- No modals or file IPC yet.
- Keep it simple: one store file is enough.

## Verification

```bash
npm run dev
```

- Canvas visible, zoom/pan work.
- Dragging a test node updates position in the store (check via React DevTools or temporary `console.log` — **remove** noise before commit or gate with `import.meta.env.DEV`).

## Acceptance criteria

- [ ] Tailwind applies (visible class on root layout).
- [ ] RF + Zustand stay in sync when dragging a node.
- [ ] `onConnect` creates a new edge in the store with default `RelationEdgeData` (`style: 'solid'`, `label: ''`).

## Next step

**`03-custom-person-node.md`**
