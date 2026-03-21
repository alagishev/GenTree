# GenTree — autonomous generation playbook (orchestration)

This repository is built through a **sequence of AI agent runs**. Each step is a separate file under `docs/agent-tasks/`. The agent **must not** ask “should I continue?”: after finishing a step it opens the next file and runs it until the queue is done or it hits a blocker.

## Stack (fixed)

| Layer | Technology |
|-------|------------|
| Desktop | Electron |
| UI | React 18+, TypeScript |
| Renderer build | Vite |
| Graph | React Flow (`@xyflow/react` or `reactflow` — lock in during step 01) |
| State | Zustand |
| Styling | Tailwind CSS |
| Files | JSON (custom format), IPC via `contextBridge` + preload |

**Not in MVP:** native `.drawio` compatibility, backend, authentication.

## Execution order (strictly by number)

1. [`docs/agent-tasks/01-electron-vite-skeleton.md`](docs/agent-tasks/01-electron-vite-skeleton.md)
2. [`docs/agent-tasks/02-tailwind-react-flow-zustand.md`](docs/agent-tasks/02-tailwind-react-flow-zustand.md)
3. [`docs/agent-tasks/03-custom-person-node.md`](docs/agent-tasks/03-custom-person-node.md)
4. [`docs/agent-tasks/04-custom-edges-connection.md`](docs/agent-tasks/04-custom-edges-connection.md)
5. [`docs/agent-tasks/05-row-snapping.md`](docs/agent-tasks/05-row-snapping.md)
6. [`docs/agent-tasks/06-editors-modals.md`](docs/agent-tasks/06-editors-modals.md)
7. [`docs/agent-tasks/07-ipc-file-menu.md`](docs/agent-tasks/07-ipc-file-menu.md)
8. [`docs/agent-tasks/08-export-png-svg.md`](docs/agent-tasks/08-export-png-svg.md)
9. [`docs/agent-tasks/09-polish-readme-qa.md`](docs/agent-tasks/09-polish-readme-qa.md)

## Non-stop mode (for agents and humans)

### Single long chat

Paste at the start of the session:

```text
You are implementing the GenTree project from the playbook in this repository.
Open AGENT_PLAYBOOK.md and run tasks from docs/agent-tasks/ in order (01→09).
After each task: run the dev build, fix errors, then move to the next file without asking for confirmation.
If a step is blocked — record the reason in AGENT_BLOCKERS.md at the repo root and stop.
```

### Subagents (parallel only where safe)

- **Sequential:** steps 01–09 — each later step depends on the previous one.
- **Do not** split 01–07 across agents without a shared merge — conflicts in `package.json` and entrypoints.
- **Exception:** after step 07 a separate agent branch can work on export (08) only if main is stable; for a clean MVP prefer **one thread**.

### Definition of “step done”

- Commands in the task file’s **Verification** section run without errors.
- Acceptance criteria in that file are satisfied (agent may checklist them in the reply).

### Blocker artifact

If a step is impossible (no network, broken toolchain), create `AGENT_BLOCKERS.md` with: step number, symptom, what you tried, what the human must do.

## Project file format (target, reference for all steps)

Extension name: e.g. `.gentree.json` (lock in during step 07).

```json
{
  "version": 1,
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "rowHeight": 120,
  "nodes": [],
  "edges": []
}
```

Derive node/edge types from TypeScript in code; the schema must match Zustand / React Flow after serialization.

---

*Update this document only when the stack or step order changes.*
