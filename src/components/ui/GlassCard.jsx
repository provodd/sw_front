/**
 * Glassmorphism card. Replaces 8+ inline copies of:
 *   {
 *     background: 'linear-gradient(...rgba(0,0,0,0.2)...), linear-gradient(...rgba(51,51,51,0.35)...)',
 *     border: '1px solid rgba(255,255,255,0.4)',
 *     backdropFilter: 'blur(50px)',
 *     borderRadius: 30,
 *   }
 *
 * Variants:
 *   default — main glass surface (.glass)
 *   soft    — translucent grey + lighter blur (.glass-soft); used for circle buttons
 */
export default function GlassCard({
  variant = 'default',
  className = '',
  style,
  onClick,
  children,
}) {
  const variantClass = variant === 'soft' ? 'glass-soft' : 'glass'
  const classes = [variantClass, className].filter(Boolean).join(' ')

  return (
    <div className={classes} style={style} onClick={onClick}>
      {children}
    </div>
  )
}
