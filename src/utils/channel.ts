import { BrowserWindow } from "electron"

export function sendChannelToMainWindow(
  channel: string,
  ...args: unknown[]
): void {
  const mainWindow = BrowserWindow.getAllWindows()[0]

  if (mainWindow) {
    mainWindow.webContents.send(channel, ...args)
  }
}

export function sendChannelToAllWindows(
  channel: string,
  ...args: unknown[]
): void {
  const windows = BrowserWindow.getAllWindows()

  for (const window of windows) {
    window.webContents.send(channel, ...args)
  }
}