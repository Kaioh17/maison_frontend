import { useState } from 'react'
import { cancelRiderBooking, type BookingResponse } from '@api/bookings'
import Button from '@components/Button'
import Modal from '@components/Modal'
import { getApiErrorMessage } from '@utils/apiError'

/**
 * Cancel a ride, with an optional reason. Close to pickup the server asks for an explicit
 * acknowledgement (a 4xx naming `acknowledge_warning`): we show its message and re-send with it set.
 */
export default function CancelDialog({ booking, onClose, onCancelled }: { booking: BookingResponse; onClose: () => void; onCancelled: (message: string) => void }) {
  const [reason, setReason] = useState('')
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await cancelRiderBooking(booking.id!, { cancellation_reason: reason.trim() || undefined, acknowledge_warning: warning != null })
      if (!res.success) return setError(res.message || 'Could not cancel the ride.')
      onCancelled(res.message || `Booking #${booking.id} cancelled.`)
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not cancel the ride.')
      if (warning == null && message.toLowerCase().includes('acknowledge_warning')) setWarning(message)
      else setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      variant="sheet"
      title={`Cancel booking #${booking.id}?`}
      onClose={onClose}
    >
      <div className="rdr-stack">
        <p className="rdr-sub" style={{ margin: 0 }}>Cancelling close to pickup time may need an extra confirmation.</p>
        {warning && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{warning}</div>}
        <label className="rdr-field">
          <span>Reason (optional)</span>
          <textarea className="rdr-input" rows={3} placeholder="Let your operator know why" value={reason} onChange={e => setReason(e.target.value)} />
        </label>
        {error && <div className="bw-notice bw-notice-err" role="alert" style={{ margin: 0 }}>{error}</div>}
        <div className="rdr-dialog-actions">
          <Button variant="destructive" fullWidth disabled={busy} onClick={send}>
            {busy ? 'Cancelling…' : warning ? 'Cancel anyway' : 'Cancel ride'}
          </Button>
          <Button variant="secondary" fullWidth disabled={busy} onClick={onClose}>Keep ride</Button>
        </div>
      </div>
    </Modal>
  )
}
