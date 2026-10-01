import { create } from 'zustand'

/** "New version available" state. `apply` activates the waiting service worker and reloads (user-initiated only). */
export const usePwaUpdate = create<{ needRefresh: boolean; apply: () => void }>(() => ({
  needRefresh: false,
  apply: () => {},
}))
