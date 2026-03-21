# Agent task 06 — Editors: person node (modal) and edge

## Prerequisites

Step **05**; store has `selectedNodeId` / `selectedEdgeId` or equivalent (add if missing).

## Goals

### Person editor (modal or side panel — pick one; modal is simpler for MVP)

- Open: **double-click** the person node.
- Fields:
  - Full name — `string`
  - Birth date — ISO `YYYY-MM-DD` (or match `<input type="date">`) / optional empty
  - Comment — multiline `string`
  - Photo: file pick → **data URL** in `data.photo` (optional size warning or canvas resize)
  - **Custom fields:** list of key/value rows, add/remove; stored in `customFields`
- Save: update Zustand and close; Cancel — no write (or discard draft).

### Edge editor

- Open: double-click the edge **or** selected edge + toolbar “Edit” — one clear path is enough.
- Fields: `label`, `style` chosen from four values (select/radio).

### UI

- Tailwind, compact, focus styles and tab order.
- Close on Escape and outside click (for modal).

## Constraints

- No IPC or export yet.

## Verification

- Create a person, open editor, fill fields, add a custom field, save — card updates.
- Open an edge, change style and label — line and label update on canvas.

## Acceptance criteria

- [ ] All default person fields are editable.
- [ ] Custom fields add/remove dynamically.
- [ ] Photo stored in `data.photo` as a string (data URL).
- [ ] Edge: label + style edit and reflect on canvas.

## Next step

**`07-ipc-file-menu.md`**
