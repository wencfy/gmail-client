import { dialog, shell } from "electron"
import { config, ConfigKey } from "../helpers/index"

export const openUrlInBrowser = async (url: string) => {
  if (config.get(ConfigKey.ConfirmExternalLinks)) {
    const { origin } = new URL(url)
    const trustedHosts = config.get(ConfigKey.TrustedHosts)

    if (!trustedHosts.includes(origin)) {
      const { response, checkboxChecked } = await dialog.showMessageBox({
        type: 'info',
        buttons: ['Open Link', 'Cancel'],
        message: `Do you want to open this external link in your default browser?`,
        checkboxLabel: `Trust all links on ${origin}`,
        detail: url,
      })

      if (response !== 0) {
        return
      }

      if (checkboxChecked) {
        config.set(ConfigKey.TrustedHosts, [...trustedHosts, origin])
      }
    }
  }

  shell.openExternal(url)
}