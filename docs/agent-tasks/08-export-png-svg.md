# Agent task 08 — PNG and SVG export

## Prerequisites

Step **07**; app reliably opens/saves projects.

## Goals

1. Menu item or toolbar **Export** with **PNG** and **SVG** (or two separate actions).
2. Export **visible area** vs **all nodes** — pick one UX and document it:
   - Preferred: **fit bounds** of all nodes + padding, then capture; user picks path/filename in the save dialog.
3. Implementation (choose what works with RF + React):
   - **PNG:** e.g. `html-to-image` (`toPng`) on the React Flow container **or** the recommended `@xyflow/react` export pattern.
   - **SVG:** e.g. `toSvg` from the same library **or** custom SVG assembly (harder) — for MVP one solid approach for both is enough if the library supports it.
4. Save dialog via IPC (main), same pattern as project files.

## Constraints

- Do not block the UI forever: use `async` + a simple indicator for heavy export.

## Known risks (handle in code)

- Tailwind / webfonts can skew canvas output — test on a real graph; inline critical styles on the canvas root during capture if needed.

## Verification

- Graph with 3 nodes and 2 edges exports to PNG and opens in an image viewer.
- SVG opens in a browser without a completely broken layout (minor differences OK).

## Acceptance criteria

- [ ] PNG saves via dialog, file is non-empty.
- [ ] SVG saves the same way.
- [ ] Export does not break editor state (viewport may change temporarily, then restore).

## Next step

**`09-polish-readme-qa.md`**
