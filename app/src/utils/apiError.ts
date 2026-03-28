/** Flattens FastAPI/axios error payloads so validation messages display in the UI. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = err as {
      response?: { data?: { detail?: unknown; message?: string; error?: string } }
    }
    const data = r.response?.data
    if (data) {
      const { detail } = data
      if (detail !== undefined && detail !== null) {
        if (typeof detail === 'string') return detail
        if (Array.isArray(detail)) {
          const parts = detail.map((item: unknown) => {
            if (typeof item === 'string') return item
            if (item && typeof item === 'object' && 'msg' in item) {
              return String((item as { msg: unknown }).msg)
            }
            return JSON.stringify(item)
          })
          return parts.filter(Boolean).join(' ')
        }
        if (typeof detail === 'object' && detail !== null && 'msg' in detail) {
          return String((detail as { msg: unknown }).msg)
        }
      }
      if (typeof data.message === 'string') return data.message
      if (typeof data.error === 'string') return data.error
    }
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}
