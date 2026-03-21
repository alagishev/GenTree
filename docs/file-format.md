# File format (`.gentree.json`)

Projects are **JSON** documents, conventionally named with a **`.gentree.json`** suffix (save dialog default: `untitled.gentree.json`). The document version is **`1`**.

## Top-level shape

```json
{
  "version": 1,
  "rowHeight": 120,
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "nodes": [],
  "edges": []
}
```

- **`rowHeight`** — vertical spacing for row snapping (pixels).
- **`viewport`** — React Flow viewport (`x`, `y`, `zoom`) when the file was saved.
- **`nodes`** — people (`type: "person"`).
- **`edges`** — relationships (`type: "relation"` in serialized output).

## Person node

Each node has an `id`, `type: "person"`, `position: { x, y }`, and `data`:

| Field | Meaning |
|-------|---------|
| `name` | Display name |
| `birthDate` | Optional ISO date string `YYYY-MM-DD` (same as `<input type="date">`) |
| `comment` | Optional free text |
| `photo` | Optional image (app-specific string; often a data URL) |
| `customFields` | Arbitrary string key/value pairs |

Older files may have stored a numeric **`birthYear`**; on open, the app migrates it to `birthDate` as `YYYY-01-01`.

## Relation edge

Edges reference `source` and `target` node ids. `data` includes:

| Field | Meaning |
|-------|---------|
| `label` | Optional line label |
| `style` | One of `solid`, `dashed`, `dotted`, `faded` |
| `arrowAtSource` | Arrowhead at the start of the edge |
| `arrowAtTarget` | Arrowhead at the end of the edge |

Multiple edges between the same pair of nodes are allowed.

## Type definitions in code

The canonical TypeScript types live in [`src/types/graph.ts`](../src/types/graph.ts). Serialization helpers are in [`src/lib/gentreeFile.ts`](../src/lib/gentreeFile.ts).
