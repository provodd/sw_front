/**
 * Empty list / no-content state.
 * Replaces the repeated emoji + title + description pattern in
 * LikesScreen, MatchesScreen, etc.
 */
export default function EmptyState({ emoji, title, description, className = '' }) {
  return (
    <div
      className={['stack-md center text-center', className].filter(Boolean).join(' ')}
      style={{ padding: '40px 32px', marginTop: 40 }}
    >
      {emoji && <div className="emoji-xl">{emoji}</div>}
      {title && <p className="text-h3 font-bold">{title}</p>}
      {description && <p className="text-small text-faint">{description}</p>}
    </div>
  )
}
