/** Browser implementation of `window.gentreeFiles` (Electron preload API). */

const JSON_PICKER_TYPES: FilePickerAcceptType[] = [
  {
    description: 'GenTree JSON',
    accept: { 'application/json': ['.json'] },
  },
]

function fileNameFromPath(p: string): string {
  const normalized = p.replace(/\\/g, '/')
  const i = normalized.lastIndexOf('/')
  return i >= 0 ? normalized.slice(i + 1) : p
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function verifyWritePermission(handle: FileSystemFileHandle): Promise<boolean> {
  const opts = { mode: 'readwrite' as const }
  const q = handle.queryPermission
  const r = handle.requestPermission
  if (typeof q !== 'function') return true
  if ((await q.call(handle, opts)) === 'granted') return true
  if (typeof r !== 'function') return false
  return (await r.call(handle, opts)) === 'granted'
}

async function writeTextToHandle(handle: FileSystemFileHandle, text: string): Promise<void> {
  const ok = await verifyWritePermission(handle)
  if (!ok) throw new Error('Write permission denied.')
  const w = await handle.createWritable()
  try {
    await w.write(text)
  } finally {
    await w.close()
  }
}

function openFileWithInput(): Promise<
  { canceled: true } | { canceled: false; content: string; filePath: string }
> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    const done = (result: { canceled: true } | { canceled: false; content: string; filePath: string }) => {
      input.remove()
      resolve(result)
    }
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) {
        done({ canceled: true })
        return
      }
      void file.text().then(
        (content) => done({ canceled: false, content, filePath: file.name }),
        () => done({ canceled: true }),
      )
    })
    input.addEventListener('cancel', () => done({ canceled: true }))
    document.body.appendChild(input)
    input.click()
  })
}

export function createBrowserGentreeFiles(fileHandleRef: { current: FileSystemFileHandle | null }) {
  return {
    async open(): Promise<
      { canceled: true } | { canceled: false; content: string; filePath: string }
    > {
      if (typeof window.showOpenFilePicker === 'function') {
        try {
          const [handle] = await window.showOpenFilePicker({
            types: JSON_PICKER_TYPES,
            excludeAcceptAllOption: true,
            multiple: false,
          })
          const file = await handle.getFile()
          const content = await file.text()
          fileHandleRef.current = handle
          return { canceled: false, content, filePath: file.name }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            return { canceled: true }
          }
          // Fall through to <input> (e.g. unsupported / transient error).
        }
      }
      fileHandleRef.current = null
      return openFileWithInput()
    },

    async save(payload: {
      content: string
      filePath: string
    }): Promise<{ canceled: true } | { canceled: false; ok: true }> {
      const handle = fileHandleRef.current
      if (handle) {
        try {
          await writeTextToHandle(handle, payload.content)
          return { canceled: false, ok: true }
        } catch (e) {
          window.alert(e instanceof Error ? e.message : 'Could not save the file.')
          return { canceled: true }
        }
      }
      const name = fileNameFromPath(payload.filePath) || 'untitled.gentree.json'
      downloadBlob(
        new Blob([payload.content], { type: 'application/json;charset=utf-8' }),
        name,
      )
      return { canceled: false, ok: true }
    },

    async saveAs(
      content: string,
    ): Promise<{ canceled: true } | { canceled: false; filePath: string }> {
      if (typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'untitled.gentree.json',
            types: JSON_PICKER_TYPES,
          })
          await writeTextToHandle(handle, content)
          fileHandleRef.current = handle
          return { canceled: false, filePath: handle.name }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            return { canceled: true }
          }
          window.alert(e instanceof Error ? e.message : 'Could not save the file.')
          return { canceled: true }
        }
      }
      downloadBlob(new Blob([content], { type: 'application/json;charset=utf-8' }), 'untitled.gentree.json')
      fileHandleRef.current = null
      return { canceled: false, filePath: 'untitled.gentree.json' }
    },

    async saveExport(opts: {
      base64: string
      defaultName: string
    }): Promise<{ canceled: true } | { canceled: false; ok: true }> {
      const blob = await (await fetch(`data:image/png;base64,${opts.base64}`)).blob()
      if (typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: opts.defaultName,
            types: [{ description: 'PNG', accept: { 'image/png': ['.png'] } }],
          })
          const ok = await verifyWritePermission(handle)
          if (!ok) return { canceled: true }
          const w = await handle.createWritable()
          try {
            await w.write(blob)
          } finally {
            await w.close()
          }
          return { canceled: false, ok: true }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            return { canceled: true }
          }
          window.alert(e instanceof Error ? e.message : 'Could not save PNG.')
          return { canceled: true }
        }
      }
      downloadBlob(blob, opts.defaultName)
      return { canceled: false, ok: true }
    },

    async saveExportText(opts: {
      text: string
      defaultName: string
    }): Promise<{ canceled: true } | { canceled: false; ok: true }> {
      const blob = new Blob([opts.text], { type: 'image/svg+xml;charset=utf-8' })
      if (typeof window.showSaveFilePicker === 'function') {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: opts.defaultName,
            types: [{ description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } }],
          })
          const ok = await verifyWritePermission(handle)
          if (!ok) return { canceled: true }
          const w = await handle.createWritable()
          try {
            await w.write(blob)
          } finally {
            await w.close()
          }
          return { canceled: false, ok: true }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            return { canceled: true }
          }
          window.alert(e instanceof Error ? e.message : 'Could not save SVG.')
          return { canceled: true }
        }
      }
      downloadBlob(blob, opts.defaultName)
      return { canceled: false, ok: true }
    },
  }
}
