# Roadmap

Planned directions for GenTree. Nothing here is tied to a release date; use it for prioritization and forks.

## Theming and visual presets

- **Canvas background** — solid colors, gradients, subtle patterns, optional grid aligned with row snapping.
- **Per-card backgrounds** — texture or color behind each person node (independent of global theme).
- **Card style packs** — named presets that bundle typography, border radius, shadows, and palette, for example: minimal (flat, high contrast), gothic (ornate borders, serif-forward), modern (large type, generous whitespace), imperial or formal (strong frames, certificate-like), plus more community themes.
- **Theme storage** — likely project-level or app-level JSON; may extend `.gentree.json` or use a sidecar file once the model is stable.

## Typographic print output

- **Print-oriented export** — PDF or high-resolution SVG/PNG tuned for professional printing (CMYK workflow, bleed, safe margins to be defined).
- **Print templates** — fixed layouts (poster tree, book spread) instead of only a screen screenshot.
- **Type scale and line length** — controls for names and body text so output survives real presses and large paper sizes.

## AI integration

### Generate graph from text

- User pastes or uploads a **narrative description** of people and relationships (natural language).
- A model (local or API) **parses** it into GenTree graph data and produces a **valid `.gentree.json`** (or an in-app patch) for review before applying.

### In-app AI assistant

- **Dedicated panel or modal** with chat-style interaction.
- **User-editable system prompt** (per project or global) defining:
  - assistant **persona** and scope (genealogy helper, layout coach, and so on)
  - **tasks** it may perform (suggest missing relatives, normalize dates, propose layout hints)
  - **response format** (plain text, markdown, structured JSON)
  - **graph I/O contract** — exact JSON shape for `nodes`, `edges`, and `data` on input and output so the app can merge suggestions safely.

### Design constraints

- **No mandatory cloud** — local models and bring-your-own API key should stay viable.
- **Inspectable output** — diff against the current graph, undo, reject.

---

When you ship a roadmap item, update [architecture.md](architecture.md) and [CURSOR_REPO_GUIDE.md](CURSOR_REPO_GUIDE.md) if file formats or IPC change.
