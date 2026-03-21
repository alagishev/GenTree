# Agent task 03 — Custom “Person” node

## Prerequisites

Step **02**: React Flow + Zustand, `type: 'person'` registered or stubbed.

## Goals

1. **`PersonNode`** component (rounded card):
   - Look: rounded corners, soft shadow (Tailwind), readable on different DPI.
   - Display: **name** (larger), birth date if present, shortened comment; **avatar** — circular preview if `photo` is set, else placeholder.
   - **Handles:** at least source/target (or multiple sides — your choice), but mouse connection must feel natural.
2. Register in `nodeTypes` on `ReactFlow`.
3. Create nodes by interacting with the empty canvas:
   - **Recommended:** double-click empty space → new node with `id` from `nanoid` / `crypto.randomUUID`, position under cursor (account for RF viewport transform — e.g. `screenToFlowPosition`).
   - Alternative if double-click conflicts: toolbar “Add person” + canvas click — document clearly in the UI.
4. New node: `data` with empty/default fields, `name: 'New person'` or localized equivalent.

## UX

- Cursor and hit areas work for mouse.
- Node drags without breaking handle connections.

## Verification

- Create 3 nodes, drag them, restart `dev` — persistence not required yet; session-only is fine.

## Acceptance criteria

- [ ] All new nodes of type `person` render with the custom component.
- [ ] Double-click (or agreed alternative) creates a node in **flow** coordinates, not screen coordinates.
- [ ] Node `data` is serializable (plain object in `data`).

## Next step

**`04-custom-edges-connection.md`**
