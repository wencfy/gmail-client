import { Notification } from 'electron'

export function createNotification(
  title: string,
  body: string,
  onClick?: () => void
): void {
  const notification = new Notification({
    body,
    title
  })

  if (onClick) {
    notification.on('click', onClick)
  }

  notification.show()
}
