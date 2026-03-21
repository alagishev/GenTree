# GenTree

Local **genealogy-style graph** editor for desktop (Electron). Sketch people and relationships quickly: add nodes, connect them, snap rows, then export **PNG** or **SVG**. Data lives in a plain **JSON** project file (`.gentree.json`).

**SEO / discoverability:** GenTree is a **simple tool for drawing genealogy trees** on the desktop—quick pedigree and family-tree sketches without a heavy genealogy database. Add people, **ancestor–descendant** links, and labels; export to PNG/SVG. Use it as a **lightweight genealogy graph editor** for kinship diagrams.

**Keywords:** simple genealogy tree drawing tool, family tree drawing software, pedigree chart editor, local offline family tree, kinship diagram, ancestor descendant graph, family tree program, genealogy diagram editor, free open source MIT.

**License:** [MIT](LICENSE).

## How to run (prebuilt)

Prebuilt binaries are published on [**GitHub Releases**](https://github.com/alagishev/GenTree/releases/latest) (that link always points at the latest release).

1. On the release page, under **Assets**, download the file for your OS:
   - **Windows:** `GenTree-Setup-*.exe` (installer) or `GenTree-*-portable.exe` (portable copy, no install).
   - **Linux:** `GenTree-*-Linux.AppImage`.
2. Run it:
   - **Windows:** open the downloaded `.exe`. Code signing is not configured—SmartScreen may warn on first run; if needed choose **More info** → **Run anyway**.
   - **Linux:** make the AppImage executable (`chmod +x GenTree-*-Linux.AppImage`) and run it; AppImage may require FUSE (see your distro’s notes).

For development from source, see [Run from source](#run-from-source) below.

## Why it exists

Full genealogy suites are often heavy; generic diagram tools are flexible but not tuned for quick family trees. GenTree targets **fast prototyping**: capture everyone you know, then rearrange and label the graph without fighting the tool.

So, I've decided to generate a tool for my own. It was en experment - how easy is to create very special tool for my own short-living requirements instead of using existing heavy tools or to use another more generic tool like draw.io. This repo is an answer. It took 0.5md

The workflow is **similar to draw.io desktop** (local files, File menu, image export), but the **file format is GenTree’s own JSON**, not draw.io XML. See [docs/analogs-and-scope.md](docs/analogs-and-scope.md).

## Documentation

| | |
|--|--|
| [Documentation index](docs/README.md) | All English guides |
| [Vision](docs/vision-and-motivation.md) | Goals and motivation |
| [Architecture](docs/architecture.md) | Stack and main code paths |
| [File format](docs/file-format.md) | `.gentree.json` schema |
| [AI / Cursor](docs/ai-development.md) | Agent playbook and repo guide |
| [Roadmap](docs/roadmap.md) | Planned features (theming, print, AI) |
| [Sample tree](docs/samples/README.md) | Example graph + how to open it |

## Requirements

- **Node.js** ≥ 18 (CI uses 22)

## Run from source

```bash
npm install
npm run dev
```

Dev uses Vite (default port **5318**, see `vite.config.ts` and `GENTREE_DEV_PORT`). If the port is busy, Vite picks the next free port and passes it to Electron via `scripts/run-dev.cjs`.

## Build

```bash
npm run build
```

Outputs: renderer in `dist/`, Electron bundles in `dist-electron/`.

### Windows (NSIS + portable)

```bash
npm run dist:win
```

Artifacts under `release/`: installer `GenTree-Setup-x.x.x.exe` and `GenTree-x.x.x-portable.exe`. Code signing is not configured; SmartScreen may prompt on first run.

### Linux (AppImage)

```bash
npm run dist:linux
```

Artifact: `release/GenTree-x.x.x-Linux.AppImage`.

### All targets (current OS)

```bash
npm run dist
```

### GitHub Releases

Pushing a tag `v*` (e.g. `v0.1.0`) triggers [`.github/workflows/release.yml`](.github/workflows/release.yml): Windows `.exe` artifacts and Linux `.AppImage` are attached to a GitHub Release. Align `package.json` `version` with the tag (without the `v` prefix).

## Quick usage

- **Double-click** empty canvas — new person (Y snaps to rows).
- **Connect** via handles on node sides; **double-click** a person or edge to edit.
- **Right-click** node or edge — context menu (edit / delete).
- **Ctrl+Z** — undo graph edits (when focus is not in an input).
- **File** — New, Open, Save, Save As; **Export PNG** / **Export SVG** (export fits all nodes in frame briefly, then restores the view).

For handle layout and edge semantics, see [docs/file-format.md](docs/file-format.md) and the step specs under [docs/agent-tasks/](docs/agent-tasks/) (ordered by [AGENT_PLAYBOOK.md](AGENT_PLAYBOOK.md)).

## Contributing / AI forks

The repo includes a sequenced agent task list under `docs/agent-tasks/` and [docs/CURSOR_REPO_GUIDE.md](docs/CURSOR_REPO_GUIDE.md) for structural edits. Fork and adapt freely under the MIT license.
