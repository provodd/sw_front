/**
 * Telegram-blue verified checkmark badge.
 * Replaces 4 inline duplicates in SwipeCard, LikesScreen, MatchesScreen, UserProfileScreen.
 */
export default function VerifiedBadge({ size = 22, className = '', style }) {
  const radius = Math.round(size * 0.27) // ~6 at 22

  return (
    <div
      className={['center shrink-0', className].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'var(--tg-blue)',
        ...style,
      }}
      aria-label="Verified"
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 7.2L5.6 9.8L11 4.4"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}
