# Cursor / agent repository guide

Read this file **before** non-trivial changes (new features, refactors, IPC changes, file format bumps). It maps the codebase so you do not guess paths or mis-state product capabilities.

## Product facts (do not invent)

- **File format**: GenTree JSON **version 1**, extension **`.gentree.json`**. **Not** draw.io XML; do **not** document or implement `.drawio` interchange unless explicitly tasked.
- **Stack**: Electron + Vite + React + TypeScript + Tailwind + `@xyflow/react` + Zustand + `html-to-image`.
- **Row layout**: Y positions snap using `rowHeight` (see `graphStore` and `constants/layout`).

## Directory map

| Path | Responsibility |
|------|------------------|
| `electron/main.ts` | `BrowserWindow`, `Menu`, `ipcMain.handle` for filesystem dialogs and writes |
| `electron/preload.ts` | `contextBridge`: `window.gentreeFiles`, `window.gentreeMenu` |
| `scripts/run-dev.cjs` | Dev orchestration; sets `GENTREE_DEV_URL` / port for Electron |
| `src/main.tsx` | React root |
| `src/App.tsx` | Shell: toolbar, modals, menu listener |
| `src/store/graphStore.ts` | Nodes, edges, selection, dirty flag, undo, load/save payload shape |
| `src/types/graph.ts` | `PersonNodeData`, `RelationEdgeData`, `GentreeFileV1` |
| `src/lib/gentreeFile.ts` | `parseGentreeJson`, `serializeGentree` |
| `src/lib/personData.ts` | Defaults / helpers for person fields |
| `src/hooks/useProjectFileActions.ts` | New/Open/Save/Save As + PNG/SVG export via IPC + React Flow |
| `src/components/GraphCanvas.tsx` | React Flow canvas, interactions |
| `src/components/PersonNode.tsx` | Person node rendering |
| `src/components/RelationEdge.tsx` | Edge rendering and styles |
| `src/components/PersonEditorModal.tsx` | Person field editor (including custom fields) |
| `src/components/EdgeEditorModal.tsx` | Edge label and style editor |
| `src/components/AppToolbar.tsx` | Toolbar actions mirroring menu |
| `src/components/GraphContextMenu.tsx` | Context menu for nodes/edges |
| `docs/agent-tasks/` | Sequenced AI tasks; order in `AGENT_PLAYBOOK.md` |

## IPC contract (main ↔ preload ↔ renderer)

Main process handlers (channels):

- `gentree:open` → `{ canceled } | { canceled: false, content, filePath }`
- `gentree:save` ← `{ filePath, content }` → `{ canceled: false, ok: true }`
- `gentree:saveAs` ← `content` → `{ canceled } | { canceled: false, filePath }`
- `gentree:saveExport` ← `{ base64, defaultName }` (PNG)
- `gentree:saveExportText` ← `{ text, defaultName }` (SVG)

Preload exposes:

- `window.gentreeFiles.open | save | saveAs | saveExport | saveExportText`
- `window.gentreeMenu.onAction` — menu sends string actions (`new`, `open`, `save`, `saveAs`, `exportPng`, `exportSvg`)

If you add a new menu action: update **`electron/main.ts`** (menu + `sendMenu`), **`preload.ts`** types if needed, and **`App.tsx`** / **`useProjectFileActions.ts`** handler.

## If you change X, touch Y

| Change | Typical files |
|--------|----------------|
| Person fields / defaults | `src/types/graph.ts`, `src/lib/personData.ts`, `PersonEditorModal.tsx`, `gentreeFile.ts` parse/serialize if schema changes |
| Edge appearance or style enum | `src/types/graph.ts`, `RelationEdge.tsx`, `EdgeEditorModal.tsx`, `gentreeFile.ts` |
| Graph behavior (snap, connect rules) | `graphStore.ts`, `GraphCanvas.tsx`, `constants/layout.ts` |
| File format version | `GentreeFileV1` type, `parseGentreeJson` migration, `serializeGentree`, **docs/file-format.md** |
| New export format | `useProjectFileActions.ts`, `main.ts` IPC + dialog filters, toolbar/menu |
| Build / packaging | `package.json` `build` section, `electron-builder`, workflows under `.github/workflows/` |

## Commands

- Dev: `npm run dev`
- Production build: `npm run build`
- Installers: `npm run dist`, `npm run dist:win`, `npm run dist:linux`

## Conventions

- TypeScript strictness as in repo; match existing React hooks and Zustand patterns.
- Prefer **small, scoped diffs**; do not refactor unrelated modules.
- User-facing UI strings may still be non-English in code; repository documentation under `docs/*.md` and agent tasks are in English.

## When stuck

If an environment blocker prevents a task, the playbook mentions **`AGENT_BLOCKERS.md`** in the repo root (optional, often gitignored).
