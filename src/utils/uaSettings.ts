import { app } from 'electron'
import { config, ConfigKey } from '../helpers/index.js'
import { platform } from './index.js'

const userAgents = {
  "windows": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0",
  "macos": "Mozilla/5.0 (Macintosh; Intel Mac OS X 11.2; rv:86.0) Gecko/20100101 Firefox/86.0",
  "linux": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:86.0) Gecko/20100101 Firefox/86.0"
}

export function removeCustomUserAgent(): void {
  config.set(ConfigKey.CustomUserAgent, '')

  app.relaunch()
  app.quit()
}

export function autoFixUserAgent(): void {
  config.set(ConfigKey.CustomUserAgent, userAgents[platform])

  app.relaunch()
  app.quit()
}
