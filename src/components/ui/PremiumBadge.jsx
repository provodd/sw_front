/**
 * Premium marker shown next to the verified badge for Premium profiles.
 * Uses the same swipe-points coin asset as the profile balance card.
 */
export default function PremiumBadge({ size = 25, className = '', style }) {
  return (
    <img
      className={['premium-badge shrink-0', className].filter(Boolean).join(' ')}
      src="/icons/coin.png"
      alt="Premium"
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  )
}
