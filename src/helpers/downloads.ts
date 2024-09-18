import * as path from "path"
import { shell } from "electron"
import * as electronDl from "electron-dl"
import config, { ConfigKey } from "./store"
import { createNotification } from "./notifications"

enum State {
  CANCELLED   = 'cancelled',
  COMPLETED   = 'completed',
  INTERRUPTED = 'interrupted',
}

const messages = {
  cancelled: 'has been cancelled',
  completed: 'has completed',
  interrupted: 'has been interrupted'
}

function onDownloadComplete(filename: string, state: `${State}`): void {
  createNotification(
    `Download ${state}`,
    `Download of file ${filename} ${messages[state]}.`,
    () => {
      shell.openPath(
        path.join(config.get(ConfigKey.DownloadsLocation), filename)
      )
    }
  )
}

export function initDownloads(): void {
  const openFolderWhenDone = config.get(ConfigKey.DownloadsOpenFolderWhenDone)
  const handleStarted = (item: Electron.DownloadItem) => {
    item.once('done', (_, state) => {
      onDownloadComplete(item.getFilename(), state)
    })
  }

  electronDl({
    saveAs: config.get(ConfigKey.DownloadsShowSaveAs),
    openFolderWhenDone,
    directory: config.get(ConfigKey.DownloadsLocation),
    showBadge: true,
    onStarted: openFolderWhenDone ? undefined : handleStarted
  })
}