import { useState } from 'react'
import { ArrowUp } from 'lucide-react'

interface UpgradePlanButtonProps {
  currentPlan?: string
  onUpgradeClick: () => void
  isMobile?: boolean
}

export default function UpgradePlanButton({ currentPlan, onUpgradeClick, isMobile = false }: UpgradePlanButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Don't show if plan is "fleet"
  if (currentPlan?.toLowerCase() === 'fleet') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 'clamp(24px, 4vw, 32px)',
      right: 'clamp(24px, 4vw, 32px)',
      zIndex: 1000
    }}>
      <button
        onClick={onUpgradeClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bw-btn bw-btn-action ${isHovered ? 'custom-hover-border' : ''}`}
        style={{
          padding: isMobile ? 'clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)' : '14px 24px',
          fontSize: isMobile ? 'clamp(14px, 2vw, 16px)' : '14px',
          fontFamily: '"Work Sans", sans-serif',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 'clamp(8px, 1.5vw, 10px)' : '8px',
          borderRadius: 7,
          backgroundColor: isHovered ? 'var(--bw-bg-secondary)' : 'var(--bw-accent)',
          color: isHovered ? 'rgba(155, 97, 209, 0.81)' : '#ffffff',
          border: isHovered ? '2px solid rgba(155, 97, 209, 0.81)' : 'none',
          borderColor: isHovered ? 'rgba(155, 97, 209, 0.81)' : undefined,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        } as React.CSSProperties}
      >
        <ArrowUp className="w-4 h-4" style={{ 
          width: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px', 
          height: isMobile ? 'clamp(18px, 2.5vw, 20px)' : '18px'
        }} />
        <span>Upgrade Plan</span>
      </button>
    </div>
  )
}

