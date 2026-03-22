export {}

type GentreeOpenResult =
  | { canceled: true }
  | { canceled: false; content: string; filePath: string }

type GentreeSaveResult = { canceled: true } | { canceled: false; ok: true }

type GentreeSaveAsResult = { canceled: true } | { canceled: false; filePath: string }

type GentreeExportResult = { canceled: true } | { canceled: false; ok: true }

declare global {
  /** Subset of the File System Access API for static typing (Chromium). */
  interface FilePickerAcceptType {
    description: string
    accept: Record<string, string[]>
  }

  interface FileSystemFileHandle {
    queryPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
    requestPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  }

  interface Window {
    showOpenFilePicker?: (options?: {
      types?: FilePickerAcceptType[]
      excludeAcceptAllOption?: boolean
      multiple?: boolean
    }) => Promise<FileSystemFileHandle[]>

    showSaveFilePicker?: (options?: {
      suggestedName?: string
      types?: FilePickerAcceptType[]
    }) => Promise<FileSystemFileHandle>

    /** Present in Electron; absent in plain Vite preview. */
    gentreeFiles?: {
      open: () => Promise<GentreeOpenResult>
      save: (payload: { content: string; filePath: string }) => Promise<GentreeSaveResult>
      saveAs: (content: string) => Promise<GentreeSaveAsResult>
      saveExport: (opts: {
        base64: string
        defaultName: string
      }) => Promise<GentreeExportResult>
      saveExportText: (opts: {
        text: string
        defaultName: string
      }) => Promise<GentreeExportResult>
    }
    gentreeMenu?: {
      onAction: (handler: (action: string) => void) => () => void
    }
  }
}
