import { FormEvent, useEffect, useMemo, useState } from 'react'
import { API_BASE } from '@config'

function normalizeHexForPicker(value: string, fallback: string): string {
  const color = value.trim()
  if (/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color)) {
    return color.startsWith('#') ? color : `#${color}`
  }
  return fallback
}

export default function TempQrEditor() {
  const [url, setUrl] = useState('https://example.com')
  const [fillColorCode, setFillColorCode] = useState('#000000')
  const [backColorCode, setBackColorCode] = useState('#ffffff')
  const [previewSrc, setPreviewSrc] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const colorAndUrlParams = useMemo(() => {
    const rawUrl = url.trim()
    const normalizedUrl =
      rawUrl && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(rawUrl) ? `https://${rawUrl}` : rawUrl

    return new URLSearchParams({
      url: normalizedUrl,
      fill_color: fillColorCode.trim(),
      back_color: backColorCode.trim(),
    })
  }, [url, fillColorCode, backColorCode])

  const resolveApiCandidates = () => {
    const sameOriginApi = '/api'
    const configured = API_BASE?.trim() || ''
    const sanitizedConfigured = configured.endsWith('/') ? configured.slice(0, -1) : configured

    const candidates = [sameOriginApi]
    if (sanitizedConfigured && !candidates.includes(sanitizedConfigured)) {
      candidates.push(sanitizedConfigured)
    }

    // Local fallback when dev proxy is unavailable.
    if (typeof window !== 'undefined') {
      const localDirect = 'http://127.0.0.1:8000/api'
      if (!candidates.includes(localDirect)) {
        candidates.push(localDirect)
      }
    }
    return candidates
  }

  const parseErrorBody = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      try {
        const json = await response.json() as { detail?: string }
        if (json?.detail) return json.detail
      } catch {
        // fall through
      }
    }
    const text = await response.text()
    return text || `Request failed (${response.status})`
  }

  const requestQrBlob = async (endpoint: '/v1/tools/temp-qr/generate' | '/v1/tools/temp-qr/download') => {
    const query = colorAndUrlParams.toString()
    const candidates = resolveApiCandidates()
    let lastError = 'Unknown QR request error'

    for (const base of candidates) {
      try {
        const response = await fetch(`${base}${endpoint}?${query}`, {
          method: 'GET',
          cache: 'no-store',
        })

        if (!response.ok) {
          const bodyError = await parseErrorBody(response)
          lastError = `${response.status} ${bodyError}`
          continue
        }

        return await response.blob()
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Network request failed'
      }
    }

    throw new Error(lastError)
  }

  const generatePreview = async () => {
    setIsGenerating(true)
    setErrorMessage('')
    try {
      const blob = await requestQrBlob('/v1/tools/temp-qr/generate')
      const blobUrl = URL.createObjectURL(blob)
      setPreviewSrc((previous) => {
        if (previous) URL.revokeObjectURL(previous)
        return blobUrl
      })
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error'
      setErrorMessage(`Could not generate QR preview: ${detail}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await generatePreview()
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setErrorMessage('')
    try {
      const blob = await requestQrBlob('/v1/tools/temp-qr/download')
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = 'temp-qr.png'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error'
      setErrorMessage(`Could not download QR image: ${detail}`)
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    void generatePreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc)
    }
  }, [previewSrc])

  const canSubmit = Boolean(url.trim())

  const pageTitle = 'QR Code Studio'
  const pageDescription = 'Official tool for generating branded QR previews and downloads.'

  const previewBoxContent = previewSrc ? (
    <img
      src={previewSrc}
      alt="QR preview"
      className="h-72 w-72 rounded-md border border-gray-200 bg-white object-contain"
    />
  ) : (
    <div className="flex h-72 w-72 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
      No preview yet
    </div>
  )

  const showError = Boolean(errorMessage)

  const generateButtonLabel = isGenerating ? 'Generating...' : 'Generate Preview'
  const downloadButtonLabel = isDownloading ? 'Downloading...' : 'Download PNG'

  const generateButtonDisabled = !canSubmit || isGenerating
  const downloadButtonDisabled = !canSubmit || isDownloading

  const statusText = showError ? errorMessage : 'Tip: enter brand colors like #EDE6D3.'

  const statusClass = showError ? 'text-red-600' : 'text-gray-600'

  const qrToolsClass = 'inline-flex w-fit rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60'

  const generateButtonClass = 'rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'

  const inputClass = 'mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black'

  const urlInputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black'

  const colorPickerClass = 'h-9 w-14 cursor-pointer rounded border border-gray-300 bg-transparent p-0'

  const containerClass = 'mx-auto w-full max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm'

  const mainClass = 'min-h-screen bg-gray-50 px-4 py-10 text-gray-900'

  const formClass = 'mt-6 space-y-4'

  const previewRowClass = 'mt-8 flex flex-col gap-3'

  const colorGridClass = 'grid gap-4 md:grid-cols-2'

  const colorControlsClass = 'flex flex-wrap items-center gap-6'

  const subtitleClass = 'mt-2 text-sm text-gray-600'

  const statusClassName = `text-sm ${statusClass}`

  const titleClass = 'text-2xl font-semibold'

  const labelClass = 'mb-2 block text-sm font-medium'

  const codeLabelClass = 'block text-sm font-medium'

  const pickerLabelClass = 'flex items-center gap-2 text-sm font-medium'

  const buttonGroupClass = 'flex flex-wrap items-center gap-3'

  const statusRowClass = 'flex items-center justify-between gap-4'

  const spacerClass = 'mt-4'

  const valuePlaceholderUrl = 'https://example.com or bho.usemaison.io/riders/login'

  const valuePlaceholderFill = '#000000 or EDE6D3'

  const valuePlaceholderBackground = '#ffffff or 2A2A2A'

  const idUrl = 'temp-qr-url'
  const idFillCode = 'temp-qr-fill-code'
  const idBackCode = 'temp-qr-back-code'
  const idFillPicker = 'temp-qr-fill'
  const idBackPicker = 'temp-qr-back'

  const fillPickerValue = normalizeHexForPicker(fillColorCode, '#000000')
  const backPickerValue = normalizeHexForPicker(backColorCode, '#ffffff')

  const onUrlChange = (value: string) => setUrl(value)
  const onFillCodeChange = (value: string) => setFillColorCode(value)
  const onBackCodeChange = (value: string) => setBackColorCode(value)
  const onFillPickerChange = (value: string) => setFillColorCode(value)
  const onBackPickerChange = (value: string) => setBackColorCode(value)

  const onDownloadClick = () => {
    void handleDownload()
  }

  return (
    <main className={mainClass}>
      <div className={containerClass}>
        <h1 className={titleClass}>{pageTitle}</h1>
        <p className={subtitleClass}>{pageDescription}</p>

        <form className={formClass} onSubmit={handleGenerate}>
          <div>
            <label className={labelClass} htmlFor={idUrl}>
              URL
            </label>
            <input
              id={idUrl}
              type="text"
              required
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className={urlInputClass}
              placeholder={valuePlaceholderUrl}
            />
          </div>

          <div className={colorGridClass}>
            <label className={codeLabelClass} htmlFor={idFillCode}>
              Fill color code
              <input
                id={idFillCode}
                type="text"
                value={fillColorCode}
                onChange={(e) => onFillCodeChange(e.target.value)}
                className={inputClass}
                placeholder={valuePlaceholderFill}
              />
            </label>

            <label className={codeLabelClass} htmlFor={idBackCode}>
              Background color code
              <input
                id={idBackCode}
                type="text"
                value={backColorCode}
                onChange={(e) => onBackCodeChange(e.target.value)}
                className={inputClass}
                placeholder={valuePlaceholderBackground}
              />
            </label>
          </div>

          <div className={colorControlsClass}>
            <label className={pickerLabelClass} htmlFor={idFillPicker}>
              Fill picker
              <input
                id={idFillPicker}
                type="color"
                value={fillPickerValue}
                onChange={(e) => onFillPickerChange(e.target.value)}
                className={colorPickerClass}
              />
            </label>

            <label className={pickerLabelClass} htmlFor={idBackPicker}>
              Background picker
              <input
                id={idBackPicker}
                type="color"
                value={backPickerValue}
                onChange={(e) => onBackPickerChange(e.target.value)}
                className={colorPickerClass}
              />
            </label>
          </div>

          <div className={statusRowClass}>
            <p className={statusClassName}>{statusText}</p>
            <div className={buttonGroupClass}>
              <button type="button" onClick={onDownloadClick} disabled={downloadButtonDisabled} className={qrToolsClass}>
                {downloadButtonLabel}
              </button>
              <button type="submit" disabled={generateButtonDisabled} className={generateButtonClass}>
                {generateButtonLabel}
              </button>
            </div>
          </div>
        </form>

        <div className={spacerClass} />

        <div className={previewRowClass}>
          {previewBoxContent}
        </div>
      </div>
    </main>
  )
}
