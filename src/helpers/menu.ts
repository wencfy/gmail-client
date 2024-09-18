import { app, dialog, Menu, MenuItemConstructorOptions, shell } from "electron"
import { is } from "electron-util"
import config, { ConfigKey } from "./store"
import { autoFixUserAgent, removeCustomUserAgent, showRestartDialog } from "../utils"
import { viewLogs } from "./logs"
import { info } from "electron-log"

export const initOrUpdateMenu = () => {
  const appMenu: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          label: `About ${app.name}`,
          role: 'about'
        },
        {
          label: 'Check for Updates...',
          click() {
            info("Check for Updates...")
          }
        },
        {
          type: 'separator'
        },
        {
          label: `Hide ${app.name}`,
          accelerator: 'CommandOrControl+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'CommandOrControl+Shift+H',
          role: 'hideOthers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: `Quit ${app.name}`,
          accelerator: 'CommandOrControl+Q',
          click() {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Confirm External Links before Opening',
          type: 'checkbox',
          checked: config.get(ConfigKey.ConfirmExternalLinks),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.ConfirmExternalLinks, checked)
          }
        },
        {
          label: is.macos ? 'Show Menu Bar Icon' : 'Show System Tray Icon',
          type: 'checkbox',
          checked: config.get(ConfigKey.EnableTrayIcon),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.EnableTrayIcon, checked)
            showRestartDialog(
              checked,
              is.macos ? 'the menu bar icon' : 'the system tray icon'
            )
          }
        },
        {
          label: 'Default Mailto Client',
          type: 'checkbox',
          checked: app.isDefaultProtocolClient('mailto'),
          click() {
            if (app.isDefaultProtocolClient('mailto')) {
              app.removeAsDefaultProtocolClient('mailto')
            } else {
              app.setAsDefaultProtocolClient('mailto')
            }
          }
        },
        {
          label: 'Launch Minimized',
          type: 'checkbox',
          checked: config.get(ConfigKey.LaunchMinimized),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.LaunchMinimized, checked)
          }
        },
        {
          label: 'Hardware Acceleration',
          type: 'checkbox',
          checked: config.get(ConfigKey.HardwareAcceleration),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.HardwareAcceleration, checked)
            showRestartDialog(checked, 'hardware acceleration')
          }
        },
        {
          label: 'Downloads',
          submenu: [
            {
              label: 'Show Save As Dialog Before Downloading',
              type: 'checkbox',
              checked: config.get(ConfigKey.DownloadsShowSaveAs),
              click({ checked }) {
                config.set(ConfigKey.DownloadsShowSaveAs, checked)

                showRestartDialog()
              }
            },
            {
              label: 'Open Folder When Done',
              type: 'checkbox',
              checked: config.get(ConfigKey.DownloadsOpenFolderWhenDone),
              click({ checked }) {
                config.set(ConfigKey.DownloadsOpenFolderWhenDone, checked)

                showRestartDialog()
              }
            },
            {
              label: 'Default Location',
              async click() {
                const { canceled, filePaths } = await dialog.showOpenDialog({
                  properties: ['openDirectory'],
                  buttonLabel: 'Select',
                  defaultPath: config.get(ConfigKey.DownloadsLocation)
                })

                if (canceled) {
                  return
                }

                config.set(ConfigKey.DownloadsLocation, filePaths[0])

                showRestartDialog()
              }
            }
          ]
        },
        {
          type: 'separator'
        },
        {
          label: 'Auto Update',
          type: 'checkbox',
          checked: config.get(ConfigKey.AutoUpdate),
          click({ checked }: { checked: boolean }) {
            config.set(ConfigKey.AutoUpdate, checked)
            showRestartDialog(checked, 'auto updates')
          }
        },
        {
          label: 'Advanced',
          submenu: [
            {
              label: 'Debug Mode',
              type: 'checkbox',
              checked: config.get(ConfigKey.DebugMode),
              click({ checked }) {
                config.set(ConfigKey.DebugMode, checked)
                showRestartDialog(checked, 'debug mode')
              }
            },
            {
              label: 'Edit Config File',
              click() {
                config.openInEditor()
              }
            },
            {
              label: 'Reset Config File',
              click() {
                config.set(ConfigKey.ResetConfig, true)
                showRestartDialog()
              }
            },
            {
              type: 'separator'
            },
            {
              label: 'User Agent',
              submenu: [
                {
                  label: 'Attempt User Agent Fix',
                  click() {
                    autoFixUserAgent()
                  }
                },
                {
                  label: 'Set Custom User Agent',
                  click() {
                    config.openInEditor()
                  }
                },
                {
                  label: 'Remove Custom User Agent',
                  enabled: Boolean(config.get(ConfigKey.CustomUserAgent)),
                  click() {
                    removeCustomUserAgent()
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      role: 'editMenu'
    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CommandOrControl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CommandOrControl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: `${app.name} Website`,
          click() {
            shell.openExternal('https://github.com/wencfy/gmail-client')
          }
        },
        {
          label: 'Report an Issue',
          click() {
            shell.openExternal(
              'https://github.com/wencfy/gmail-client/issues/new'
            )
          }
        },
        {
          label: 'View Logs',
          visible: config.get(ConfigKey.DebugMode),
          click() {
            viewLogs()
          }
        }
      ]
    }
  ]

  // Add the develop menu when running in the development environment
  if (is.development) {
    appMenu.splice(-1, 0, {
      label: 'Develop',
      submenu: [
        {
          label: 'Clear Cache and Restart',
          click() {
            // Clear app config
            config.clear()
            // Restart without firing quitting events
            app.relaunch()
            app.exit(0)
          }
        }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(appMenu)

  Menu.setApplicationMenu(menu)
}