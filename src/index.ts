import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent, Menu, Tray } from "electron"
import { is } from "electron-util"
import * as path from "path"
import {
  config,
  ConfigKey,
  getTrayIcon,
  initDownloads,
  initInspect,
  initOrUpdateMenu,
  online
} from "./helpers/index"
import { autoFixUserAgent, removeCustomUserAgent, sendChannelToMainWindow, setStyle } from "./utils/index"

initInspect()
initDownloads()

if (!config.get(ConfigKey.HardwareAcceleration)) {
  app.disableHardwareAcceleration()
}

const launchMinimized =
  app.commandLine.hasSwitch('launch-minimized') ||
  config.get(ConfigKey.LaunchMinimized)

app.setAppUserModelId("com.wencfy.gmail-client")

const trayIcon = getTrayIcon()
const trayIconUnread = getTrayIcon(true)
let mainWindow: BrowserWindow
let isQuitting = false
let tray: Tray | undefined

if (!app.requestSingleInstanceLock()) {
  // if another one already running, quit
  app.quit()
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.show()
  }
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  }
})

app.on('before-quit', () => {
  isQuitting = true

  if (mainWindow) {
    config.set(ConfigKey.LastWindowState, {
      bounds: mainWindow.getBounds(),
      fullscreen: mainWindow.isFullScreen(),
      maximized: mainWindow.isMaximized()
    })
  }
});

const createMainWindow = (): void => {
  const lastWindowState = config.get(ConfigKey.LastWindowState)
  const { width, height, x, y } = lastWindowState.bounds

  mainWindow = new BrowserWindow({
    title: app.name,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 24 },
    minWidth: 780,
    minHeight: 200,
    width,
    height,
    x,
    y,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'helpers', 'preload.js')
    },
    show: !launchMinimized,
    icon: is.linux
      ? path.join(__dirname, '..', '..', 'static', 'icon.png')
      : undefined
  })

  if (lastWindowState.fullscreen && !mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(true)
  }

  if (lastWindowState.maximized && !mainWindow.isMaximized()) {
    mainWindow.maximize()
  }

  if (is.linux || is.windows) {

  }

  mainWindow.loadURL('https://mail.google.com')

  mainWindow.on('app-command', (_event, command) => {
    if (
      command === 'browser-backward' &&
      mainWindow.webContents.navigationHistory.canGoBack()
    ) {
      mainWindow.webContents.navigationHistory.goBack()
    } else if (
      command === 'browser-forward' &&
      mainWindow.webContents.navigationHistory.canGoForward()
    ) {
      mainWindow.webContents.navigationHistory.goForward()
    }
  })

  mainWindow.webContents.on('dom-ready', () => {
    setStyle(mainWindow)
    // initCustomStyles()
  })

  mainWindow.webContents.on('did-finish-load', async () => {
    if (mainWindow.webContents.getURL().includes('signin/rejected')) {
      const message = `It looks like you are unable to sign-in, because Gmail is blocking the user agent ${app.name} is using.`
      const askAutoFixMessage = `Do you want ${app.name} to attempt to fix it automatically?`
      const troubleshoot = () => {
      }

      if (config.get(ConfigKey.CustomUserAgent)) {
        const { response } = await dialog.showMessageBox({
          type: 'info',
          message,
          detail: `You're currently using a custom user agent. ${askAutoFixMessage} Alternatively you can try the default user agent or set another custom user agent (see "Troubleshoot").`,
          buttons: ['Yes', 'Cancel', 'Use Default User Agent', 'Troubleshoot']
        })

        if (response === 3) {
          troubleshoot()
          return
        }

        if (response === 2) {
          removeCustomUserAgent()
          return
        }

        if (response === 1) {
          return
        }

        return
      }

      const { response } = await dialog.showMessageBox({
        type: 'info',
        message,
        detail: `${askAutoFixMessage} Alternatively you can set a custom user agent (see "Troubleshoot").`,
        buttons: ['Yes', 'Cancel', 'Troubleshoot']
      })

      if (response === 2) {
        troubleshoot()
        return
      }

      if (response === 1) {
        return
      }

      autoFixUserAgent()
    }
  })

  mainWindow.on('close', (error) => {
    if (!isQuitting) {
      error.preventDefault()
      mainWindow.blur()
      mainWindow.hide()
    }
  })

  ipcMain.on('unread', (_: IpcMainEvent, unreadCount: number) => {
    if (is.macos) {
      app.dock.setBadge(unreadCount ? unreadCount.toString() : '')
    }

    if (tray) {
      tray.setImage(unreadCount ? trayIconUnread : trayIcon)
      if (is.macos) {
        tray.setTitle(unreadCount ? unreadCount.toString() : '')
      }
    }
  })
}

(async () => {
  await Promise.all([online(), app.whenReady()])

  const customUserAgent = config.get(ConfigKey.CustomUserAgent)

  if (customUserAgent) {
    app.userAgentFallback = customUserAgent
  }

  createMainWindow()

  initOrUpdateMenu()

  if (config.get(ConfigKey.EnableTrayIcon) && !tray) {
    tray = new Tray(trayIcon)
    tray.setToolTip(app.name)
    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.show()
      }
    })
  }

  if (is.macos) {
    if (!config.get(ConfigKey.ShowDockIcon)) {
      app.dock.hide()
    }

    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'Compose',
        click() {
          mainWindow.show()
          sendChannelToMainWindow('compose')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Inbox',
        click() {
          mainWindow.show()
          sendChannelToMainWindow('inbox')
        }
      },
      {
        label: 'Snoozed',
        click() {
          mainWindow.show()
          sendChannelToMainWindow('snoozed')
        }
      },
      {
        label: 'Sent',
        click() {
          mainWindow.show()
          sendChannelToMainWindow('sent')
        }
      },
      {
        label: 'All Mail',
        click() {
          mainWindow.show()
          sendChannelToMainWindow('all-mail')
        }
      }
    ])

    app.dock.setMenu(dockMenu)
  }

  const { webContents } = mainWindow!

  webContents.on('dom-ready', () => {
    if (!launchMinimized) {
      mainWindow.show()
    }
  })

  // webContents.setWindowOpenHandler(({
  //   url
  // }) => {
  //   if (url.startsWith('https://accounts.google.com')) {
  //     mainWindow.loadURL(url)
  //   }


  //   return {
  //     action: 'allow'
  //   }
  // })
})()