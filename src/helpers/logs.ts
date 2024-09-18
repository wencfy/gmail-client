import { shell } from 'electron'
import { transports } from "electron-log"

export function viewLogs(): void {
  shell.openPath(transports.file.getFile().path)
}