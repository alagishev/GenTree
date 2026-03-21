import { useReactFlow } from '@xyflow/react'
import { toPng, toSvg } from 'html-to-image'
import { useCallback, useMemo, useState } from 'react'
import { parseGentreeJson, serializeGentree } from '../lib/gentreeFile'
import { useGraphStore } from '../store/graphStore'

function dataUrlToSvgText(dataUrl: string): string {
  const base64Prefix = 'data:image/svg+xml;base64,'
  const utf8Prefix = 'data:image/svg+xml;charset=utf-8,'
  if (dataUrl.startsWith(base64Prefix)) {
    const b64 = dataUrl.slice(base64Prefix.length)
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  }
  if (dataUrl.startsWith(utf8Prefix)) {
    return decodeURIComponent(dataUrl.slice(utf8Prefix.length))
  }
  const comma = dataUrl.indexOf(',')
  if (comma >= 0) return decodeURIComponent(dataUrl.slice(comma + 1))
  return dataUrl
}

async function withExportView<T>(
  rf: ReturnType<typeof useReactFlow>,
  run: () => Promise<T>,
): Promise<T> {
  const prev = rf.getViewport()
  try {
    rf.fitView({ padding: 0.15, duration: 200 })
    await new Promise((r) => setTimeout(r, 280))
    return await run()
  } finally {
    rf.setViewport(prev)
  }
}

export function useProjectFileActions() {
  const rf = useReactFlow()
  const rowHeight = useGraphStore((s) => s.rowHeight)
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const dirty = useGraphStore((s) => s.dirty)
  const currentFilePath = useGraphStore((s) => s.currentFilePath)
  const loadProject = useGraphStore((s) => s.loadProject)
  const newEmptyGraph = useGraphStore((s) => s.newEmptyGraph)
  const markSaved = useGraphStore((s) => s.markSaved)

  const [exporting, setExporting] = useState(false)

  const snapshotPayload = useCallback(() => {
    const vp = rf.getViewport()
    return {
      rowHeight,
      viewport: vp,
      nodes,
      edges,
    }
  }, [rf, rowHeight, nodes, edges])

  const doNew = useCallback(async () => {
    if (dirty) {
      const ok = window.confirm('You have unsaved changes. Create a new file?')
      if (!ok) return
    }
    newEmptyGraph()
  }, [dirty, newEmptyGraph])

  const doOpen = useCallback(async () => {
    if (!window.gentreeFiles) return
    const res = await window.gentreeFiles.open()
    if (res.canceled || !('content' in res)) return
    try {
      const data = parseGentreeJson(res.content)
      loadProject(data)
      markSaved(res.filePath)
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not open the file.')
    }
  }, [loadProject, markSaved])

  const doSave = useCallback(async () => {
    if (!window.gentreeFiles) return
    const payload = snapshotPayload()
    const text = serializeGentree(payload)
    if (currentFilePath) {
      const res = await window.gentreeFiles.save({ content: text, filePath: currentFilePath })
      if (!res.canceled && 'ok' in res && res.ok) markSaved(currentFilePath)
    } else {
      const res = await window.gentreeFiles.saveAs(text)
      if (!res.canceled && 'filePath' in res) markSaved(res.filePath)
    }
  }, [currentFilePath, markSaved, snapshotPayload])

  const doSaveAs = useCallback(async () => {
    if (!window.gentreeFiles) return
    const text = serializeGentree(snapshotPayload())
    const res = await window.gentreeFiles.saveAs(text)
    if (!res.canceled && 'filePath' in res) markSaved(res.filePath)
  }, [markSaved, snapshotPayload])

  const captureTarget = useCallback(() => {
    return document.querySelector('.react-flow__viewport') as HTMLElement | null
  }, [])

  const doExportPng = useCallback(async () => {
    if (!window.gentreeFiles) return
    const target = captureTarget()
    if (!target) {
      window.alert('Canvas not found for export.')
      return
    }
    setExporting(true)
    try {
      await withExportView(rf, async () => {
        const dataUrl = await toPng(target, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#f8fafc',
        })
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
        const res = await window.gentreeFiles.saveExport({
          base64,
          defaultName: 'gentree-export.png',
        })
        if (res.canceled) return
        if (!('ok' in res) || !res.ok) window.alert('Could not save PNG.')
      })
    } catch {
      window.alert('Error while exporting PNG.')
    } finally {
      setExporting(false)
    }
  }, [captureTarget, rf])

  const doExportSvg = useCallback(async () => {
    if (!window.gentreeFiles) return
    const target = captureTarget()
    if (!target) {
      window.alert('Canvas not found for export.')
      return
    }
    setExporting(true)
    try {
      await withExportView(rf, async () => {
        const dataUrl = await toSvg(target, { cacheBust: true, backgroundColor: '#f8fafc' })
        const svgText = dataUrlToSvgText(dataUrl)
        const res = await window.gentreeFiles.saveExportText({
          text: svgText,
          defaultName: 'gentree-export.svg',
        })
        if (res.canceled) return
        if (!('ok' in res) || !res.ok) window.alert('Could not save SVG.')
      })
    } catch {
      window.alert('Error while exporting SVG.')
    } finally {
      setExporting(false)
    }
  }, [captureTarget, rf])

  const fitAll = useCallback(() => {
    rf.fitView({ padding: 0.2, duration: 300 })
  }, [rf])

  return useMemo(
    () => ({
      doNew,
      doOpen,
      doSave,
      doSaveAs,
      doExportPng,
      doExportSvg,
      fitAll,
      exporting,
    }),
    [
      doNew,
      doOpen,
      doSave,
      doSaveAs,
      doExportPng,
      doExportSvg,
      fitAll,
      exporting,
    ],
  )
}

export type ProjectFileActions = ReturnType<typeof useProjectFileActions>
