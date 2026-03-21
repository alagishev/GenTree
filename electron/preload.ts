import { contextBridge, ipcRenderer } from 'electron'

export type GentreeOpenResult =
  | { canceled: true }
  | { canceled: false; content: string; filePath: string }

export type GentreeSaveResult = { canceled: true } | { canceled: false; ok: true }

export type GentreeSaveAsResult =
  | { canceled: true }
  | { canceled: false; filePath: string }

export type GentreeExportResult = { canceled: true } | { canceled: false; ok: true }

const gentreeFiles = {
  open: (): Promise<GentreeOpenResult> => ipcRenderer.invoke('gentree:open'),
  save: (payload: {
    content: string
    filePath: string
  }): Promise<GentreeSaveResult> => ipcRenderer.invoke('gentree:save', payload),
  saveAs: (content: string): Promise<GentreeSaveAsResult> =>
    ipcRenderer.invoke('gentree:saveAs', content),
  saveExport: (opts: {
    base64: string
    defaultName: string
  }): Promise<GentreeExportResult> => ipcRenderer.invoke('gentree:saveExport', opts),
  saveExportText: (opts: {
    text: string
    defaultName: string
  }): Promise<GentreeExportResult> => ipcRenderer.invoke('gentree:saveExportText', opts),
}

contextBridge.exposeInMainWorld('gentreeFiles', gentreeFiles)

contextBridge.exposeInMainWorld('gentreeMenu', {
  onAction: (handler: (action: string) => void) => {
    const fn = (_event: unknown, action: string) => handler(action)
    ipcRenderer.on('gentree-menu', fn)
    return () => {
      ipcRenderer.removeListener('gentree-menu', fn)
    }
  },
})
