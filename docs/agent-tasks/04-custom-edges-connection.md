# Agent task 04 — Custom edges, styles, label

## Prerequisites

Step **03**: custom nodes, `onConnect` adds edges.

## Goals

1. Add **`edgeTypes`** with a custom edge component (based on `BaseEdge` / `getBezierPath` or `SmoothStep` from RF — your choice).
2. Render edge **label** on or near the center of the line (readable when zoomed).
3. Line styles from `data.style`:
   - `solid` — normal stroke;
   - `dashed` — medium `strokeDasharray`;
   - `dotted` — fine dash;
   - `faded` — low opacity, can stay solid.
4. When creating an edge from the UI, set `data: { label: '', style: 'solid' }`.
5. **Edge selection:** click selects the edge; store `selectedEdgeId` (clear on pane click — typical editor behavior).

## Constraints

- Edge field editor (modal) is step **06**; here, store data and visuals only.

## Verification

- Create edges with different `style` values manually in the store or via a temporary “demo edges” button; confirm styles differ.
- Remove temporary buttons before finishing the step.

## Acceptance criteria

- [ ] All edges use the custom type.
- [ ] Four styles are visually distinct.
- [ ] Label shows when non-empty.
- [ ] Edge selection works and is stored in Zustand.

## Next step

**`05-row-snapping.md`**
