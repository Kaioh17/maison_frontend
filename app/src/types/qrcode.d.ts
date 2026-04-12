declare module 'qrcode' {
  export type QRCodeToDataURLOptions = {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    type?: string
    quality?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
    width?: number
  }

  const QRCode: {
    toDataURL: (text: string, options?: QRCodeToDataURLOptions) => Promise<string>
  }

  export default QRCode
}
