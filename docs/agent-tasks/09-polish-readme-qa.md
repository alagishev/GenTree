# Agent task 09 — Polish, README, final QA

## Prerequisites

Steps **01–08** complete.

## Goals

1. **Toolbar** (minimal): New shortcut optional; buttons/menu aligned with IPC (duplication OK).
2. **Fit view** — “Show all” button using React Flow `fitView` with padding.
3. **Errors:**
   - invalid JSON on Open — clear `alert` or toast (no heavy new libraries);
   - user cancels file dialog — silent exit.
4. **README.md** at repo root:
   - what the app is;
   - requirements: Node version (state tested or `>=18`);
   - `npm run dev` / `npm run build` as applicable;
   - how to save/open `.gentree.json`;
   - how to export PNG/SVG.
5. Pass over the project: remove dead code, stray `console.log`, large commented blocks.
6. **Linter:** if ESLint exists — `npm run lint` clean; if not configured — do not expand scope; `npm run build` if the script exists is enough.

## Verification (manual agent checklist)

- Create 4 nodes, 3 edges, different edge styles.
- Row snap works.
- Node/edge editors work.
- Save → restart → Open restores state.

## Acceptance criteria

- [ ] README is complete and honest (no promise of draw.io file format).
- [ ] Fit view works.
- [ ] No critical console errors in a normal session.
- [ ] Playbook stays accurate: update `AGENT_PLAYBOOK.md` only if scripts/stack changed.

## End of chain

If everything is done — tell the user briefly: **MVP ready**, how to run, where the file format is documented.

Optionally add `CHANGELOG.md` with version `0.1.0`.
