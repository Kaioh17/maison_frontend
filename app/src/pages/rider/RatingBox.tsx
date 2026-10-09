import { useState, type KeyboardEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getBookingRating } from '@api/bookings'
import { createBookingRating } from '@api/user'
import Button from '@components/Button'
import { getApiErrorMessage } from '@utils/apiError'
import { Star, starFill } from './Stars'
import type { RiderShellCtx } from './useRiderData'

/** Rate a completed ride in half-star steps, or read back the rating already given. */
export default function RatingBox({ bookingId, userId, notify }: { bookingId: number; userId: RiderShellCtx['userId']; notify: RiderShellCtx['notify'] }) {
  const qc = useQueryClient()
  const [value, setValue] = useState<number | null>(null)
  const [comment, setComment] = useState('')

  const key = ['rider', userId, 'rating', bookingId]
  const existing = useQuery({
    queryKey: key,
    // A ride with no rating yet answers 404; that is "not rated", not a failure.
    queryFn: () => getBookingRating(bookingId).then(r => r.data ?? null).catch(err => (err?.response?.status === 404 ? null : Promise.reject(err))),
  })
  const submit = useMutation({
    mutationFn: () => createBookingRating({ booking_id: bookingId, rating_value: value!, review_comment: comment.trim() || undefined }),
    onSuccess: res => {
      if (!res.success) return notify({ ok: false, text: res.message || 'Could not submit your rating' })
      notify({ ok: true, text: res.message || 'Thanks for rating your ride' })
      void qc.invalidateQueries({ queryKey: key })
    },
    onError: err => notify({ ok: false, text: getApiErrorMessage(err, 'Could not submit your rating') }),
  })

  const rated = existing.data
  if (existing.isLoading) return null

  if (rated) {
    return (
      <div className="rdr-note">
        <strong>Your rating</strong>
        <div className="rdr-star-static" role="img" aria-label={`${rated.rating_value.toFixed(1)} out of 5`}>
          {[1, 2, 3, 4, 5].map(i => <Star key={i} fill={starFill(rated.rating_value, i)} />)}
        </div>
        {rated.review_comment && <p style={{ margin: '8px 0 0' }}>{rated.review_comment}</p>}
      </div>
    )
  }

  const shown = value ?? 0
  const step = (e: KeyboardEvent) => {
    const now = value ?? 0
    const next = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? Math.min(5, now + 0.5)
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? Math.max(0.5, now - 0.5)
      : e.key === 'Home' ? 0.5 : e.key === 'End' ? 5 : null
    if (next == null) return
    e.preventDefault()
    setValue(next)
  }

  return (
    <div className="rdr-note">
      <strong>Rate this ride</strong>
      <div className="rdr-stack" style={{ gap: 12 }}>
        <div
          className="rdr-stars"
          role="slider"
          tabIndex={0}
          aria-label="Rate this ride"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={value ?? 0}
          aria-valuetext={value == null ? 'No rating selected' : `${value.toFixed(1)} out of 5`}
          onKeyDown={step}
        >
          {[1, 2, 3, 4, 5].map(i => (
            <div className="rdr-star" key={i}>
              <Star fill={starFill(shown, i)} size={34} />
              {[i - 0.5, i].map(v => (
                <button key={v} type="button" tabIndex={-1} aria-label={`${v} stars`} onClick={() => setValue(v)} />
              ))}
            </div>
          ))}
        </div>
        <textarea className="rdr-input" rows={2} placeholder="How was your ride? (optional)" aria-label="Comment" value={comment} onChange={e => setComment(e.target.value)} />
        <Button fullWidth disabled={value == null || submit.isPending} onClick={() => submit.mutate()}>
          {submit.isPending ? 'Submitting…' : 'Submit rating'}
        </Button>
      </div>
    </div>
  )
}
