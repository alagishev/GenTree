# Sample trees

This folder contains **ready-made** GenTree project files (`.gentree.json`) you can open in the app.

## Clark–Reed family (`clark-reed-family.gentree.json`)

Small three-generation example:

- **G1:** Ida Clark, Henry Clark  
- **G2:** Martha Clark (their daughter), James Reed (Martha’s spouse)  
- **G3:** Laura Reed (daughter of Martha and James)

Edges use labels such as `parent` and `spouse`; styles include solid and dashed lines.

### How to open in GenTree

1. Run the app from source: `npm run dev`, or start an installed build.
2. **File → Open…** (or **Open…** on the toolbar).
3. Browse to this repository folder:  
   `docs/samples/clark-reed-family.gentree.json`
4. Confirm — the graph loads with saved positions and viewport.

If you already have an unsaved graph, the app may ask whether to discard changes before opening.

### After opening

- Use **Fit all** to frame every node if the view feels off.
- **Double-click** a person or edge to edit; **right-click** for context actions.
- **Save as…** to copy the sample elsewhere and experiment without overwriting the repo file.

### File format

The sample is **version 1** JSON, same as described in [../file-format.md](../file-format.md).
