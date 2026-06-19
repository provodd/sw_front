import CircleIconButton from './CircleIconButton.jsx'

/**
 * Back arrow. Two variants:
 *   circle — soft glass circle with ‹ arrow (used in UserProfileScreen, PremiumScreen)
 *   text   — bare back arrow (used in modals / inline)
 */
export default function BackButton({
  onClick,
  variant = 'circle',
  className = '',
  style,
}) {
  if (variant === 'text') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Назад"
        className={['btn-ghost text-h2', className].filter(Boolean).join(' ')}
        style={style}
      >
        ‹
      </button>
    )
  }

  return (
    <CircleIconButton
      onClick={onClick}
      ariaLabel="Назад"
      className={className}
      style={style}
    >
      <span className="emoji-md" style={{ color: 'var(--text)', marginTop: -2 }}>‹</span>
    </CircleIconButton>
  )
}
