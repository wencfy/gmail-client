import { app } from 'electron'
import { is } from 'electron-util'

import ElectronStore = require('electron-store')

interface LastWindowState {
	bounds: {
		width: number
		height: number
		x: number | undefined
		y: number | undefined
	}
	fullscreen: boolean
	maximized: boolean
}

export enum ConfigKey {
  AutoUpdate = 'autoUpdate',
  DebugMode = 'debugMode',
  LastWindowState = 'lastWindowState',
  LaunchMinimized = 'launchMinimized',
  AutoHideMenuBar = 'autoHideMenuBar',
  EnableTrayIcon = 'enableTrayIcon',
  ShowDockIcon = 'showDockIcon',
  CustomUserAgent = 'customUserAgent',
  AutoFixUserAgent = 'autoFixUserAgent',
  TrustedHosts = 'trustedHosts',
  ConfirmExternalLinks = 'confirmExternalLinks',
  HardwareAcceleration = 'hardwareAcceleration',
  DownloadsShowSaveAs = 'downloadsShowSaveAs',
  DownloadsOpenFolderWhenDone = 'downloadsOpenFolderWhenDone',
  DownloadsLocation = 'downloadsLocation',
  DarkMode = 'darkMode',
  ResetConfig = 'resetConfig',
  ReleaseChannel = 'releaseChannel'
}

type TypedStore = {
  [ConfigKey.AutoUpdate]: boolean
  [ConfigKey.LastWindowState]: LastWindowState
  [ConfigKey.DebugMode]: boolean
  [ConfigKey.LaunchMinimized]: boolean
  [ConfigKey.AutoHideMenuBar]: boolean
  [ConfigKey.EnableTrayIcon]: boolean
  [ConfigKey.ShowDockIcon]: boolean
  [ConfigKey.CustomUserAgent]: string
  [ConfigKey.AutoFixUserAgent]: boolean
  [ConfigKey.TrustedHosts]: string[]
  [ConfigKey.ConfirmExternalLinks]: boolean
  [ConfigKey.HardwareAcceleration]: boolean
  [ConfigKey.DownloadsShowSaveAs]: boolean
  [ConfigKey.DownloadsOpenFolderWhenDone]: boolean
  [ConfigKey.DownloadsLocation]: string
  [ConfigKey.DarkMode]?: 'system' | boolean
  [ConfigKey.ResetConfig]: boolean
  [ConfigKey.ReleaseChannel]: 'stable' | 'dev'
}

const defaults: TypedStore = {
  [ConfigKey.AutoUpdate]: true,
  [ConfigKey.LastWindowState]: {
    bounds: {
      width: 860,
      height: 600,
      x: undefined,
      y: undefined
    },
    fullscreen: false,
    maximized: false
  },
  [ConfigKey.DebugMode]: is.development,
  [ConfigKey.LaunchMinimized]: false,
  [ConfigKey.AutoHideMenuBar]: false,
  [ConfigKey.EnableTrayIcon]: true,
  [ConfigKey.ShowDockIcon]: true,
  [ConfigKey.CustomUserAgent]: '',
  [ConfigKey.AutoFixUserAgent]: false,
  [ConfigKey.TrustedHosts]: [],
  [ConfigKey.ConfirmExternalLinks]: true,
  [ConfigKey.HardwareAcceleration]: true,
  [ConfigKey.DownloadsShowSaveAs]: false,
  [ConfigKey.DownloadsOpenFolderWhenDone]: false,
  [ConfigKey.DownloadsLocation]: app.getPath('downloads'),
  [ConfigKey.ResetConfig]: false,
  [ConfigKey.ReleaseChannel]: 'stable',
}

const config = new ElectronStore<TypedStore>({
  defaults,
  name: is.development ? 'config.dev' : 'config',
})

if (config.get(ConfigKey.ResetConfig)) {
	config.clear()
	config.set(ConfigKey.ResetConfig, false)
}

export default config