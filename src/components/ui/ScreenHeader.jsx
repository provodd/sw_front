/**
 * Top-of-screen title. Replaces inline
 *   <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3, padding: '100px 14px ...' }}>
 * which appeared in 4+ screens.
 *
 * Top padding is adaptive to screen height (80-120px).
 * Pass `compact` for sub-screens (40-60px top padding).
 */
export default function ScreenHeader({
  title,
  compact = false,
  sticky = false,
  className = '',
  children,
}) {
  const classes = [
    'text-h2',
    'text-tight',
    'font-extra',
    sticky && 'sticky-header',
    className,
  ].filter(Boolean).join(' ')

  const style = {
    padding: compact
      ? 'var(--header-safe-compact) var(--gutter) 0'
      : 'var(--header-safe-top) var(--gutter) 0',
    ...(sticky && { position: 'sticky', top: 0, zIndex: 'var(--z-sticky)' }),
  }

  return (
    <h2 className={classes} style={style}>
      {title}
      {children}
    </h2>
  )
}
