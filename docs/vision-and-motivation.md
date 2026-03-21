# Vision and motivation

GenTree is a **small, local desktop editor** for sketching **genealogy-style graphs** quickly: people as nodes, relationships as edges, minimal ceremony.

## What problem it solves

Many genealogy tools are either **heavy** (full databases, research workflows, accounts) or **awkward** for a first pass. The goal here is **prototyping**: drop everyone you know onto the canvas, then drag, connect, and tidy the graph until the structure makes sense.

The interaction model is deliberately close to a **diagram editor**: mouse-first creation of cards and links, simple geometric shapes, and a layout that stays readable (row-based placement instead of arbitrary pixel soup).

## How it was built

The initial codebase was produced **end-to-end with AI assistance**, using a fixed stack and a sequenced task list in this repository. That makes the project easy to **fork** and continue in your own repo with the same agent playbook or your own process.

## Relationship to “a draw.io-like app”

The **desktop experience** is inspired by apps like **diagrams.net / draw.io desktop**: local files, a File menu, and raster/vector export. The **on-disk format is not** draw.io XML. GenTree uses its own JSON project file (`.gentree.json`). Import/export of `.drawio` is **not** part of the current scope.
