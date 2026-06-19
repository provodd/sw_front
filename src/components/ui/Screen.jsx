/**
 * Root container for every screen.
 * Replaces the duplicated `position: absolute, inset: 0, ...` pattern.
 *
 * Variants:
 *   default  — app background (radial gradient → black)
 *   gradient — onboarding pink radial gradient
 *   black    — solid #000
 *
 * Props:
 *   withNav  — adds bottom padding so content doesn't hide under BottomNav
 *   centered — centers children (use for splash / banned / loaders)
 *   scroll   — true (default) → overflowY auto; false → overflow hidden
 *   className, style — escape hatch
 */
export default function Screen({
  variant = 'default',
  withNav = false,
  centered = false,
  scroll = true,
  className = '',
  style,
  children,
}) {
  const variantClass =
    variant === 'gradient' ? 'screen--gradient' :
    variant === 'black'    ? 'screen--black'    : ''

  const classes = [
    'screen',
    variantClass,
    centered && 'screen--centered',
    withNav && 'screen--with-nav',
    !scroll && 'overflow-hidden',
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes} style={style}>{children}</div>
}
