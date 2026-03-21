# Agent task 05 — Snap nodes to horizontal rows (Y-snap)

## Prerequisites

Step **04** done; nodes drag and positions update in the store.

## Goals

1. Introduce **`ROW_HEIGHT`** (e.g. `120` in `src/constants/layout.ts` or a store field for future tuning).
2. On **end** of node drag (`onNodeDragStop` in React Flow):
   - compute `ySnap = Math.round(node.position.y / ROW_HEIGHT) * ROW_HEIGHT`;
   - update the node position in the store (RF must receive updated state).
3. On **creating** a new node (double-click / button from step 03):
   - apply the same formula to `y` so nodes do not appear “between rows”.
4. Optional: subtle row guides — **very** thin horizontal lines via custom `Background` or CSS; skip if noisy (behavior matters more than visuals).

## Notes

- Multiple nodes on the same Y row are **allowed**; X stays free.
- Multi-select drag (if enabled) — snap **each** node or the group; minimum: single-node drag works reliably.

## Verification

- Drag a node between rows — on release, Y snaps to the nearest row.
- Create a node at an arbitrary click height — Y still lands on the grid.

## Acceptance criteria

- [ ] After drag, Y is always a multiple of `ROW_HEIGHT` (document origin/offset in a code comment if needed).
- [ ] New nodes appear on the Y grid.
- [ ] No noticeable jitter **during** drag (snap only on stop).

## Next step

**`06-editors-modals.md`**
