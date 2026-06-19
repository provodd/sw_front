/**
 * Small pill tag for inline metadata (interests, attributes, etc.)
 *
 * Variants:
 *   muted — translucent white (default; ProfileScreen InfoChip)
 *   pink  — solid dark pink (UserProfileScreen Chip)
 *   dark  — solid dark
 */
export default function Chip({ variant = 'muted', className = '', style, children }) {
  const bg =
    variant === 'pink' ? '#a11257' :
    variant === 'dark' ? 'rgba(0,0,0,0.4)' :
                         'var(--surface-elev-2)'

  return (
    <span
      className={['text-small text-tight', className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-block',
        padding: '5px 12px',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        color: 'var(--text)',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
