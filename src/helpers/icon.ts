import * as path from "path"
import { nativeImage } from "electron"
import { is } from "electron-util"

export const getTrayIcon = (unread?: boolean) => {
  let iconFileName

  if (is.macos) {
    iconFileName = 'menu.macos.png'
  } else {
    iconFileName = unread ? 'tray-unread.png' : 'tray.png'
  }

  return nativeImage.createFromPath(
    path.join(__dirname, '..', '..', 'static', iconFileName)
  )
}