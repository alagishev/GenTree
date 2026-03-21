# Agent task 07 — File menu, IPC, JSON `.gentree.json`

## Prerequisites

Step **06**; graph fully in Zustand and serializable.

## Goals

### File format

Extension: **`.gentree.json`** (or `.json` with a “GenTree” filter in the dialog).

Minimum schema:

```json
{
  "version": 1,
  "rowHeight": 120,
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "nodes": [],
  "edges": []
}
```

- `nodes` / `edges` — same objects as in React Flow, **without** non-serializable fields (functions). Strip RF internals before write and restore on load if needed.

### Main process

- **File** menu: New, Open, Save, Save As (Save As optional but preferred).
- Use `dialog.showOpenDialog` / `showSaveDialog`.
- Read/write UTF-8.

### Preload

- `contextBridge.exposeInMainWorld('gentreeFiles', { open, save, saveAs, ... })` — names up to you, but a **clear** contract.
- Renderer types: `src/global.d.ts` with `Window & { gentreeFiles: ... }`.

### Renderer

- **New:** confirm if there are unsaved changes (simple `dirty` flag in Zustand).
- **Open:** parse JSON, validate `version`, load into store + apply viewport to the `ReactFlow` instance (`setViewport` from `useReactFlow` or ref).
- **Save / Save As:** serialize store → pretty-printed JSON.

### Security

- Do not set `nodeIntegration: true` in the renderer.
- IPC channels — whitelist in preload.

## Verification

- Build a graph, Save As → quit (or New) → Open — graph restored, positions and edges intact.
- New clears the graph after confirmation.

## Acceptance criteria

- [ ] File menu works on Windows.
- [ ] File read/write preserves `data` on nodes and edges.
- [ ] `dirty` updates on graph edits.
- [ ] No direct `fs` in the renderer.

## Next step

**`08-export-png-svg.md`**
