import { app, BrowserWindow, Menu, dialog, ipcMain, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'

const isDev = process.env.NODE_ENV === 'development'
/** Full dev server URL (set by scripts/run-dev.cjs). Fallback for manual `electron .` only. */
const devServerUrl =
  process.env.GENTREE_DEV_URL || `http://127.0.0.1:${process.env.GENTREE_DEV_PORT || '5318'}`

function sendMenu(win: BrowserWindow | null, action: string): void {
  win?.webContents.send('gentree-menu', action)
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendMenu(win, 'new'),
        },
        {
          label: 'Open…',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendMenu(win, 'open'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendMenu(win, 'save'),
        },
        {
          label: 'Save As…',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendMenu(win, 'saveAs'),
        },
        { type: 'separator' },
        {
          label: 'Export PNG…',
          click: () => sendMenu(win, 'exportPng'),
        },
        {
          label: 'Export SVG…',
          click: () => sendMenu(win, 'exportSvg'),
        },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      void shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  if (isDev) {
    void win.loadURL(devServerUrl)
  } else {
    void win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  return win
}

function registerIpc(): void {
  ipcMain.handle('gentree:open', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePaths } = await dialog.showOpenDialog(win ?? undefined, {
      filters: [
        { name: 'GenTree JSON', extensions: ['json'] },
        { name: 'All', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })
    if (canceled || !filePaths[0]) return { canceled: true as const }
    const content = await fs.readFile(filePaths[0], 'utf-8')
    return { canceled: false as const, content, filePath: filePaths[0] }
  })

  ipcMain.handle(
    'gentree:save',
    async (_event, payload: { filePath: string; content: string }) => {
      await fs.writeFile(payload.filePath, payload.content, 'utf-8')
      return { canceled: false as const, ok: true as const }
    },
  )

  ipcMain.handle('gentree:saveAs', async (event, content: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePath } = await dialog.showSaveDialog(win ?? undefined, {
      filters: [
        { name: 'GenTree JSON', extensions: ['json'] },
        { name: 'All', extensions: ['*'] },
      ],
      defaultPath: 'untitled.gentree.json',
    })
    if (canceled || !filePath) return { canceled: true as const }
    await fs.writeFile(filePath, content, 'utf-8')
    return { canceled: false as const, filePath }
  })

  ipcMain.handle(
    'gentree:saveExport',
    async (event, opts: { base64: string; defaultName: string }) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      const { canceled, filePath } = await dialog.showSaveDialog(win ?? undefined, {
        filters: [{ name: 'PNG', extensions: ['png'] }],
        defaultPath: opts.defaultName,
      })
      if (canceled || !filePath) return { canceled: true as const }
      const buf = Buffer.from(opts.base64, 'base64')
      await fs.writeFile(filePath, buf)
      return { canceled: false as const, ok: true as const }
    },
  )

  ipcMain.handle(
    'gentree:saveExportText',
    async (event, opts: { text: string; defaultName: string }) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      const { canceled, filePath } = await dialog.showSaveDialog(win ?? undefined, {
        filters: [{ name: 'SVG', extensions: ['svg'] }],
        defaultPath: opts.defaultName,
      })
      if (canceled || !filePath) return { canceled: true as const }
      await fs.writeFile(filePath, opts.text, 'utf-8')
      return { canceled: false as const, ok: true as const }
    },
  )
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
