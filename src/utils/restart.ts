import { app, dialog } from "electron"

export async function showRestartDialog(
  enabled?: boolean,
  name?: string
): Promise<void> {
  const state = enabled ? 'enable' : 'disable'

  const { response } = await dialog.showMessageBox({
    type: 'info',
    buttons: ['Restart', 'Cancel'],
    message: 'Restart required',
    detail:
      typeof enabled === 'boolean' && name
        ? `To ${state} ${name}, please restart ${app.name}`
        : 'A restart is required to apply the settings'
  })

  // If restart was clicked (index of 0), restart the app
  if (response === 0) {
    app.relaunch()
    app.quit()
  }
}