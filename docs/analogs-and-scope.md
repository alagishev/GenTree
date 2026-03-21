# Analogs and scope

## Similar tools (analogs)

| Tool | Overlap with GenTree | Difference |
|------|----------------------|------------|
| **diagrams.net (draw.io)** | Desktop-style file workflow; diagram editing; PNG/SVG export | General-purpose shapes, not genealogy-specific; **`.drawio` XML**, not GenTree JSON |
| **Gramps** | Genealogy data and family structures | Full research database, steep learning curve, not a lightweight sketch pad |
| **Web family tree builders** (e.g. vendor-hosted trees) | Visual trees, sharing | Accounts, cloud, often not a simple local file editor |
| **yEd / OmniGraffle / Visio** | Graphs and layouts | Heavy general diagramming; no first-class “person card + row snap” model |

GenTree sits in a narrow niche: **fast local sketching** of a family-style graph with **opinionated** nodes and edges and **row-based** placement.

## Explicit non-goals (current codebase)

- **No** native **`.drawio` / `.xml`** diagram interchange.
- **No** server, sync, or user **authentication**.
- **No** GEDCOM or other standard genealogy exchange format (unless added deliberately later).

If you need draw.io compatibility or GEDCOM, treat those as **separate features** with their own design and tasks.
