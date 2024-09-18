import * as fs from "fs"
import * as path from "path"
import { app, BrowserWindow } from "electron"
import { platform } from "./index"

const USER_CUSTOM_STYLE_PATH = path.join(
  app.getPath('userData'),
  'custom.css'
)

export const setStyle = (window: BrowserWindow) => {
  // windowElement.webContents.insertCSS(
  //   fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8')
  // )

  if (fs.existsSync(USER_CUSTOM_STYLE_PATH)) {
    window.webContents.insertCSS(
      fs.readFileSync(USER_CUSTOM_STYLE_PATH, 'utf8')
    )
  }

  const platformCSSFile = path.join(
    __dirname,
    '..',
    '..',
    'css',
    `style.${platform}.css`
  )
  if (fs.existsSync(platformCSSFile)) {
    window.webContents.insertCSS(
      fs.readFileSync(platformCSSFile, 'utf8')
    )
  }
}