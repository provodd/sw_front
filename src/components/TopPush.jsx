import { useEffect, useState } from 'react'

export default function TopPush({ open, children, duration = 2000, onClose, className = '' }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsClosing(false)
      return undefined
    }

    setIsClosing(false)
    const closeTimer = window.setTimeout(() => setIsClosing(true), duration)
    const removeTimer = window.setTimeout(() => onClose?.(), duration + 280)

    return () => {
      window.clearTimeout(closeTimer)
      window.clearTimeout(removeTimer)
    }
  }, [duration, onClose, open])

  if (!open) return null

  return (
    <div className={`top-push-layer ${isClosing ? 'is-closing' : ''}`}>
      <div className={`top-push glass-light ${className}`} role="status" aria-live="polite">
        {children}
      </div>
    </div>
  )
}
