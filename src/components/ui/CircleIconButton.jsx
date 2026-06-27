/**
 * Circular "soft glass" icon button.
 * Replaces the locally-defined `CircleBtn` duplicated in
 *   - SwipeScreen.jsx (lines 11-30)
 *   - UserProfileScreen.jsx (lines 4-22)
 */
export default function CircleIconButton({
  onClick,
  size = 50,
  className = '',
  style,
  ariaLabel,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={['circle-icon-button', 'glass-soft', 'center', className].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
