import { create } from 'zustand'
import { sendAssistantChat, type ChatMessage } from '@api/ai'
import { getApiErrorMessage } from '@utils/apiError'

interface AssistantState {
  messages: ChatMessage[]
  pending: boolean
  error: string | null
  send: (text: string) => Promise<void>
  reset: () => void
}

/**
 * One conversation shared by the /tenant/assistant page and the floating drawer,
 * so it survives navigation between dashboard and settings. In-memory only.
 */
export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [],
  pending: false,
  error: null,
  send: async (text) => {
    const content = text.trim()
    if (!content || get().pending) return
    const next: ChatMessage[] = [...get().messages, { role: 'user', content }]
    set({ messages: next, error: null, pending: true })
    try {
      const reply = await sendAssistantChat(next)
      set({ messages: [...next, { role: 'assistant', content: reply }] })
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Something went wrong. Please try again.') })
    } finally {
      set({ pending: false })
    }
  },
  reset: () => set({ messages: [], error: null }),
}))
