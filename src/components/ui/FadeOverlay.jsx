/**
 * Absolute gradient overlay — typically used over photo cards
 * to ensure white text on top has contrast.
 * Replaces 5+ inline duplicates of the same `linear-gradient(...)` block.
 *
 * Position: 'bottom' | 'top'   (default 'bottom')
 * Height:   any CSS length     (default '45%')
 */
export default function FadeOverlay({ position = 'bottom', height = '45%', style }) {
  const positionStyle = position === 'top'
    ? { top: 0, left: 0, right: 0, height, background: 'var(--gradient-fade-top)' }
    : { bottom: 0, left: 0, right: 0, height, background: 'var(--gradient-fade-bottom)' }

  return (
    <div
      className="no-pointer"
      style={{ position: 'absolute', ...positionStyle, ...style }}
    />
  )
}
