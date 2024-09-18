import * as debug from 'electron-debug'
import config, { ConfigKey } from './store'

export function initInspect(): void {
  debug({
    showDevTools: false,
    isEnabled: config.get(ConfigKey.DebugMode)
  })
}
