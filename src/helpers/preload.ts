import { ipcRenderer } from "electron"

const stateData = {
  unread: 0
}

const hasKey = <T extends object>(obj: T, k: keyof any): k is keyof T => k in obj;

export const state = new Proxy(stateData, {
  get(target, prop) {
    return hasKey(target, prop) ? target[prop] : undefined;
  },
  set(obj, p, value) {
    if (p === "unread") {
      if (value !== obj[p]) {
        ipcRenderer.send("unread", value)
        obj.unread = value
      }
      return true
    }
    return false
  }
})

function getUnreadCount(): number {
  const inboxLabel = document.querySelector(
    '[href*="mail/u/0/#inbox"]'
  )

  if (inboxLabel) {
    const label: Element | null = inboxLabel?.parentElement?.nextElementSibling ?? null

    // Return the unread count (0 by default)
    if (label?.textContent) {
      return Number(/\d*/.exec(label.textContent))
    }
  }
  return 0
}

window.addEventListener('load', () => {
  console.log('load')
  state.unread = getUnreadCount()

  // Listen to changes to the document title
  const title = document.querySelector('title')

  if (title) {
    const observer = new MutationObserver(() => {
      state.unread = getUnreadCount()
    })
    observer.observe(title, { childList: true })
  }
})