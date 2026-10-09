import { useState } from 'react'
import type { OverviewLinkKey, OverviewLinkQrState } from './shared'

const QR_FILENAMES: Record<OverviewLinkKey, string> = {
  landing: 'maison-landing-page-qr.png',
  rider: 'maison-rider-login-qr.png',
  driver: 'maison-driver-login-qr.png',
}

/** Copy / QR-code actions for the shareable links card on the Overview tab. */
export function useOverviewLinks() {
  const [copiedLink, setCopiedLink] = useState<OverviewLinkKey | null>(null)
  const [qrState, setQrState] = useState<Record<OverviewLinkKey, OverviewLinkQrState>>({
    rider: { loading: false, imageDataUrl: null, error: null },
    driver: { loading: false, imageDataUrl: null, error: null },
    landing: { loading: false, imageDataUrl: null, error: null },
  })

  const copyLink = async (kind: OverviewLinkKey, url: string) => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(kind)
      window.setTimeout(() => setCopiedLink(null), 2000)
    } catch {
      console.error('Clipboard copy failed')
    }
  }

  const generateQr = async (kind: OverviewLinkKey, url: string) => {
    if (!url) return
    setQrState(prev => ({ ...prev, [kind]: { ...prev[kind], loading: true, error: null } }))

    try {
      // qrcode is only needed when a QR is actually generated - keep it out of the dashboard chunk
      const { default: QRCode } = await import('qrcode')
      const imageDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320 })
      setQrState(prev => ({ ...prev, [kind]: { loading: false, imageDataUrl, error: null } }))
    } catch {
      setQrState(prev => ({
        ...prev,
        [kind]: { ...prev[kind], loading: false, error: 'Could not generate QR code right now. Please try again.' },
      }))
    }
  }

  const downloadQr = (kind: OverviewLinkKey, imageDataUrl: string) => {
    const link = document.createElement('a')
    link.href = imageDataUrl
    link.download = QR_FILENAMES[kind]
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return { copiedLink, qrState, copyLink, generateQr, downloadQr }
}
