import CircleIconButton from './CircleIconButton.jsx'

/**
 * Close (×) button — soft-glass circle.
 * Used by modals and overlay screens.
 */
export default function CloseButton({ onClick, className = '', style, size = 40 }) {
  return (
    <CircleIconButton
      onClick={onClick}
      size={size}
      ariaLabel="Закрыть"
      className={className}
      style={style}
    >
      <span className="emoji-sm" style={{ color: 'var(--text)' }}>✕</span>
    </CircleIconButton>
  )
}
