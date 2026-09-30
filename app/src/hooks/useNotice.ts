import { useCallback, useEffect, useRef, useState } from 'react'

export type NoticeState = { ok: boolean; text: string } | null

/** Inline feedback state: success auto-dismisses after 4s, errors stay until the next action. */
export function useNotice(): [NoticeState, (next: NoticeState) => void] {
  const [notice, setState] = useState<NoticeState>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const setNotice = useCallback((next: NoticeState) => {
    window.clearTimeout(timer.current)
    setState(next)
    if (next?.ok) timer.current = window.setTimeout(() => setState(null), 4000)
  }, [])
  return [notice, setNotice]
}
