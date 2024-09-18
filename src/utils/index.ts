import { platform as getPlatform } from "electron-util"

export { setStyle } from "./styles"
export { openUrlInBrowser } from "./window"
export { removeCustomUserAgent, autoFixUserAgent } from "./uaSettings"
export { showRestartDialog } from "./restart"
export { sendChannelToAllWindows, sendChannelToMainWindow } from "./channel"

export const platform: 'macos' | 'linux' | 'windows' = getPlatform({
    macos: 'macos',
    linux: 'linux',
    windows: 'windows'
})
