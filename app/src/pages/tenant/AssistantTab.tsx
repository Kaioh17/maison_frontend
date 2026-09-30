import { Fragment, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaperPlaneRight, Sparkle, ArrowCounterClockwise } from '@phosphor-icons/react'
import Button from '@components/Button'
import { sendAssistantChat, type ChatMessage } from '@api/ai'
import { getApiErrorMessage } from '@utils/apiError'
import { DASH_FONT } from './shared'

const SUGGESTIONS = [
  'How is my business doing?',
  'Which bookings are pending?',
  'How do I add a driver?',
  'How do I change my branding?',
  'What does my plan include?',
]

const INLINE = /\[([^\]]+)\]\((\/[^)\s]*)\)|\*\*([^*]+)\*\*/g

/** Tiny renderer: paragraphs, "-" bullets, **bold**, and [label](/in-app/path) links. No HTML is ever injected. */
function renderInline(text: string, go: (path: string) => void): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(INLINE)) {
    out.push(text.slice(last, m.index))
    out.push(
      m[2] ? (
        <a key={m.index} href={m[2]} onClick={(e) => { e.preventDefault(); go(m[2]) }} style={{ color: 'var(--bw-accent)', textDecoration: 'underline' }}>{m[1]}</a>
      ) : (
        <strong key={m.index}>{m[3]}</strong>
      )
    )
    last = m.index! + m[0].length
  }
  out.push(text.slice(last))
  return out
}

function RichText({ text, go }: { text: string; go: (path: string) => void }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        const bullet = /^\s*[-*]\s+(.*)/.exec(line)
        if (!line.trim()) return <div key={i} style={{ height: 8 }} />
        return (
          <div key={i} style={bullet ? { display: 'flex', gap: 8, paddingLeft: 4 } : undefined}>
            {bullet && <span aria-hidden>•</span>}
            <span>{renderInline(bullet ? bullet[1] : line, go)}</span>
          </div>
        )
      })}
    </>
  )
}

export default function AssistantTab() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, pending])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || pending) return
    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setError(null)
    setPending(true)
    try {
      const reply = await sendAssistantChat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong. Please try again.'))
    } finally {
      setPending(false)
    }
  }

  const bubble = (role: ChatMessage['role']): React.CSSProperties => ({
    maxWidth: 'min(640px, 88%)',
    padding: '12px 16px',
    borderRadius: 16,
    borderBottomRightRadius: role === 'user' ? 4 : 16,
    borderBottomLeftRadius: role === 'user' ? 16 : 4,
    background: role === 'user' ? 'var(--bw-accent)' : 'var(--bw-bg-secondary)',
    color: role === 'user' ? '#fff' : 'var(--bw-text)',
    border: role === 'user' ? 'none' : '1px solid var(--bw-border)',
    fontSize: 14,
    lineHeight: 1.55,
    fontFamily: DASH_FONT,
    wordBreak: 'break-word',
  })

  return (
    <div className="assistant-page" style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', width: '100%', maxWidth: 900, margin: '0 auto', padding: '20px 16px 0', backgroundColor: 'var(--bw-bg)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px 16px' }}>
        <Sparkle size={22} weight="fill" style={{ color: 'var(--bw-accent)' }} aria-hidden />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 600, fontFamily: DASH_FONT, color: 'var(--bw-text)', letterSpacing: '-0.01em' }}>Maison Assistant</h1>
          <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 300, fontFamily: DASH_FONT, color: 'var(--bw-muted)' }}>Ask about your bookings, drivers and fleet, or how to do anything in Maison.</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" onClick={() => { setMessages([]); setError(null) }} aria-label="Start a new chat">
            <ArrowCounterClockwise size={16} aria-hidden /> New chat
          </Button>
        )}
      </header>

      <div role="log" aria-live="polite" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 4px 16px' }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 520 }}>
            <Sparkle size={40} weight="duotone" style={{ color: 'var(--bw-accent)', display: 'block', margin: '0 auto' }} aria-hidden />
            <p style={{ fontFamily: DASH_FONT, color: 'var(--bw-muted)', fontSize: 14, margin: '8px 0 16px' }}>Try one of these to get started.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="secondary" onClick={() => send(s)}>{s}</Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={bubble(m.role)}>
              {m.role === 'user' ? <Fragment>{m.content}</Fragment> : <RichText text={m.content} go={navigate} />}
            </div>
          </div>
        ))}
        {pending && (
          <div style={{ display: 'flex' }}>
            <div style={{ ...bubble('assistant'), display: 'flex', gap: 6, alignItems: 'center' }} aria-label="Assistant is typing">
              {[0, 1, 2].map((d) => <span key={d} className="bw-skeleton" style={{ width: 8, height: 8, borderRadius: '50%', animationDelay: `${d * 0.15}s` }} />)}
            </div>
          </div>
        )}
        {error && <div role="alert" style={{ color: 'var(--bw-error)', fontSize: 13, fontFamily: DASH_FONT, padding: '0 4px' }}>{error}</div>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input) }}
        style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: '12px 4px calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--bw-border)' }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          rows={1}
          maxLength={4000}
          placeholder="Ask anything about Maison…"
          aria-label="Message"
          style={{ flex: 1, resize: 'none', maxHeight: 140, minHeight: 44, boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--bw-border)', background: 'var(--bw-bg-secondary)', color: 'var(--bw-text)', fontFamily: DASH_FONT, fontSize: 14, outline: 'none' }}
        />
        <Button type="submit" disabled={pending || !input.trim()} aria-label="Send message"><PaperPlaneRight size={18} weight="fill" aria-hidden /></Button>
      </form>
    </div>
  )
}
