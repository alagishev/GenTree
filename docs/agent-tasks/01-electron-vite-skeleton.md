# Agent task 01 — Skeleton: Electron + Vite + React + TypeScript

## Role

You are a senior engineer. You create **from scratch** a working desktop app shell. No graph or business logic yet — only reliable `npm install` / `npm run dev`.

## Product context

**GenTree**: local genealogy graph editor (nodes = people, edges = relationships). Full functionality comes in later playbook steps (`AGENT_PLAYBOOK.md`).

## Goals for this step

1. Initialize **Vite + React + TypeScript** in a renderer subfolder or repo root — your choice, but the outcome must be predictable:
   - Recommended layout: `electron/` (main, preload) + `src/` (React) at repo root, Vite root = repo root **or** `renderer/` — one `package.json`, scripts aligned.
2. Wire **Electron**:
   - `main` opens `BrowserWindow` with `loadURL` to the dev server in development and `file://` / `loadFile` to built `index.html` in production.
   - **Required:** `contextIsolation: true`, dedicated **preload** (`.cjs` or correct ESM setup — no unsafe `nodeIntegration` in the renderer for Node access).
3. Minimal React screen: title “GenTree”, placeholder “graph comes in step 02”.
4. `package.json` scripts:
   - `dev` — Vite dev server + Electron together (e.g. `concurrently` or `wait-on` — adding a dependency is fine).
   - `build` — Vite build + copy artifacts if needed; **electron-builder** can wait (step 01 only needs `npm run dev`).

## Non-functional requirements

- Windows is the target OS; use cross-platform paths in scripts.
- No secrets in the repo.
- `.gitignore`: `node_modules`, `dist`, `out`, logs.

## Files (reference)

- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
- `electron/main.ts` (or `.js` after build — TS preferred with esbuild/tsx)
- `electron/preload.ts` — expose empty or stub API via `contextBridge`
- `src/main.tsx`, `src/App.tsx`

Plain JS main is OK if simpler; renderer must stay typed.

## Verification (run yourself)

```bash
npm install
npm run dev
```

Electron window opens, UI visible, no fatal console errors.

## Acceptance criteria

- [ ] `npm run dev` starts the app with one command.
- [ ] Preload is wired; fix unsafe-config warnings in the renderer console when possible.
- [ ] Repo layout is clear for the next step (imports from `src/`).

## Next step

Open and run **`02-tailwind-react-flow-zustand.md`** without asking the user for confirmation.
