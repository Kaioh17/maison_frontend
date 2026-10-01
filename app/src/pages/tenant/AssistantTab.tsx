import { Sparkle, ArrowCounterClockwise } from '@phosphor-icons/react'
import Button from '@components/Button'
import AssistantChat from '@components/AssistantChat'
import { useAssistantStore } from '@store/assistant'
import { DASH_FONT } from './shared'

export default function AssistantTab() {
  const { messages, reset } = useAssistantStore()

  return (
    <div className="assistant-page" style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', width: '100%', maxWidth: 900, margin: '0 auto', padding: '20px 16px 0', backgroundColor: 'var(--bw-bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px 16px' }}>
        <Sparkle size={22} weight="fill" style={{ color: 'var(--bw-accent)' }} aria-hidden />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 600, fontFamily: DASH_FONT, color: 'var(--bw-text)', letterSpacing: '-0.01em' }}>Maison Assistant</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 300, fontFamily: DASH_FONT, color: 'var(--bw-muted)' }}>Ask about your bookings, drivers and fleet, or how to do anything in Maison.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" onClick={reset} aria-label="Start a new chat">
            <ArrowCounterClockwise size={16} aria-hidden /> New chat
          </Button>
        )}
      </header>

      <AssistantChat />
    </div>
  )
}
