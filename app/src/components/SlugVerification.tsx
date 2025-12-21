import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { verifySlug } from '@api/tenant'
import NotFound404 from './NotFound404'

interface SlugVerificationProps {
  children: React.ReactNode
}

export default function SlugVerification({ children }: SlugVerificationProps) {
  const { slug } = useParams<{ slug: string }>()
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setIsValid(false)
      setIsLoading(false)
      return
    }

    const checkSlug = async () => {
      try {
        setIsLoading(true)
        const response = await verifySlug(slug)
        if (response.success && response.data) {
          setIsValid(true)
        } else {
          setIsValid(false)
        }
      } catch (error: any) {
        // Check if it's a 404 error
        if (error.response?.status === 404) {
          setIsValid(false)
        } else {
          // For other errors, we might want to still show the page or handle differently
          setIsValid(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkSlug()
  }, [slug])

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Work Sans, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!isValid) {
    return <NotFound404 />
  }

  return <>{children}</>
}
