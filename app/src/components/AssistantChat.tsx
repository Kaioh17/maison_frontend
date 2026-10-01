import { Fragment, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaperPlaneRight, Sparkle } from '@phosphor-icons/react'
import Button from '@components/Button'
import type { ChatMessage } from '@api/ai'
import { useAssistantStore } from '@store/assistant'
import { DASH_FONT } from '@pages/tenant/shared'

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

interface AssistantChatProps {
  /** Called after an in-app link in a reply is followed (the drawer uses it to get out of the way on mobile). */
  onNavigate?: () => void
  autoFocus?: boolean
}

/** Message log + composer. State lives in `useAssistantStore`, so every mount shows the same conversation. */
export default function AssistantChat({ onNavigate, autoFocus }: AssistantChatProps) {
  const navigate = useNavigate()
  const { messages, pending, error, send } = useAssistantStore()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, pending])
  useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])

  const submit = (text: string) => {
    if (!text.trim() || pending) return
    setInput('')
    void send(text)
  }

  const go = (path: string) => { navigate(path); onNavigate?.() }

  const bubble = (role: ChatMessage['role']): React.CSSProperties => ({
    maxWidth: 'min(640px, 88%)',
    padding: '12px 16px',
    borderRadius: 16,
    borderBottomRightRadius: role === 'user' ? 4 : 16,
    borderBottomLeftRadius: role === 'user' ? 16 : 4,
    background: role === 'user' ? 'var(--bw-accent)' : 'var(--bw-bg-secondary)',
    color: role === 'user' ? 'white' : 'var(--bw-text)',
    border: role === 'user' ? 'none' : '1px solid var(--bw-border)',
    fontSize: 14,
    lineHeight: 1.55,
    fontFamily: DASH_FONT,
    wordBreak: 'break-word',
  })

  return (
    <>
      <div role="log" aria-live="polite" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 4px 16px' }}>
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 520 }}>
            <Sparkle size={40} weight="duotone" style={{ color: 'var(--bw-accent)', display: 'block', margin: '0 auto' }} aria-hidden />
            <p style={{ fontFamily: DASH_FONT, color: 'var(--bw-muted)', fontSize: 14, margin: '8px 0 16px' }}>Try one of these to get started.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="secondary" onClick={() => submit(s)}>{s}</Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={bubble(m.role)}>
              {m.role === 'user' ? <Fragment>{m.content}</Fragment> : <RichText text={m.content} go={go} />}
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
        onSubmit={(e) => { e.preventDefault(); submit(input) }}
        style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: '12px 4px calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid var(--bw-border)' }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input) } }}
          ref={inputRef}
          rows={1}
          maxLength={4000}
          placeholder="Ask anything about Maison…"
          aria-label="Message"
          style={{ flex: 1, resize: 'none', maxHeight: 140, minHeight: 44, boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1px solid var(--bw-border)', background: 'var(--bw-bg-secondary)', color: 'var(--bw-text)', fontFamily: DASH_FONT, fontSize: 14, outline: 'none' }}
        />
        <Button type="submit" disabled={pending || !input.trim()} aria-label="Send message"><PaperPlaneRight size={18} weight="fill" aria-hidden /></Button>
      </form>
    </>
  )
}
