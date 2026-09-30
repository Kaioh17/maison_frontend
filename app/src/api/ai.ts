import { http } from './http'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function sendAssistantChat(messages: ChatMessage[]) {
  const { data } = await http.post<{ data: { reply: string } }>('/v1/ai/chat', { messages })
  return data.data.reply
}
