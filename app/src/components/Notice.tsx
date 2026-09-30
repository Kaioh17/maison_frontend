import type { NoticeState } from '@hooks/useNotice'

/** Inline success/error message (`.bw-notice`). The wrapper is always mounted so screen readers announce changes. */
export default function Notice({ notice }: { notice: NoticeState }) {
  return (
    <div aria-live="polite">
      {notice && <div className={`bw-notice ${notice.ok ? 'bw-notice-ok' : 'bw-notice-err'}`}>{notice.text}</div>}
    </div>
  )
}
