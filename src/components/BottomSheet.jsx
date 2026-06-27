import { useState, useRef, useEffect } from 'react'

export default function BottomSheet({ onClose, children, className = '' }) {
  const [isClosing, setIsClosing] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [hasEntered, setHasEntered] = useState(false)
  const closeTimer = useRef(null)
  const enterTimer = useRef(null)
  const sheetRef = useRef(null)
  const drag = useRef(null)

  useEffect(() => {
    enterTimer.current = window.setTimeout(() => setHasEntered(true), 420)
    return () => {
      window.clearTimeout(closeTimer.current)
      window.clearTimeout(enterTimer.current)
    }
  }, [])

  const requestClose = () => {
    if (isClosing) return
    setIsClosing(true)
    closeTimer.current = window.setTimeout(() => onClose?.(), 280)
  }

  const startDrag = (event) => {
    event.stopPropagation()
    if (isClosing || event.button !== 0) return
    if (event.target.closest('button, input, textarea, select, a')) return
    let scrollParent = event.target
    while (scrollParent && scrollParent !== sheetRef.current) {
      if (scrollParent.scrollHeight > scrollParent.clientHeight && scrollParent.scrollTop > 0) return
      scrollParent = scrollParent.parentElement
    }
    if (sheetRef.current?.scrollTop > 0) return
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const moveDrag = (event) => {
    event.stopPropagation()
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    const delta = Math.max(0, event.clientY - drag.current.startY)
    const now = performance.now()
    const elapsed = Math.max(1, now - drag.current.lastTime)
    drag.current.velocity = (event.clientY - drag.current.lastY) / elapsed
    drag.current.lastY = event.clientY
    drag.current.lastTime = now
    setDragY(delta)
  }

  const finishDrag = (event) => {
    event.stopPropagation()
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    const sheetHeight = sheetRef.current?.offsetHeight || window.innerHeight
    const shouldClose = dragY > sheetHeight * 0.32 || drag.current.velocity > 0.65
    drag.current = null
    if (shouldClose) requestClose()
    else setDragY(0)
  }

  const backdropOpacity = Math.max(0, 1 - dragY / ((sheetRef.current?.offsetHeight || 600) * 0.75))

  return (
    <div
      className={`bottom-sheet-layer row ${isClosing ? 'is-closing' : ''} ${drag.current ? 'is-dragging' : ''} ${hasEntered ? 'has-entered' : ''}`}
      style={{ '--sheet-drag-y': `${dragY}px`, '--sheet-backdrop-opacity': backdropOpacity }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onPointerCancel={(event) => event.stopPropagation()}
    >
      <div
        onClick={(event) => {
          event.stopPropagation()
          requestClose()
        }}
        className="bottom-sheet-backdrop absolute-fill"
        style={hasEntered ? { opacity: backdropOpacity } : undefined}
      />
      <div
        ref={sheetRef}
        className={`bottom-sheet glass-light relative full-w overflow-hidden ${className}`}
        role="dialog"
        aria-modal="true"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{
          maxHeight: 'calc(90vh - clamp(12px, 4vw, 18px))',
          padding: '12px 20px 40px',
          overflowY: 'auto',
          transform: hasEntered ? `translateY(${dragY}px)` : undefined,
        }}
      >
        <div className="bottom-sheet-handle mx-auto" style={{
          width: 63, height: 5, background: 'rgba(255,255,255,0.2)',
          borderRadius: 100, marginBottom: 20,
        }} />
        {typeof children === 'function' ? children(requestClose) : children}
      </div>
    </div>
  )
}
