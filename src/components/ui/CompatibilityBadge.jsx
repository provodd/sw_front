/**
 * Бейдж мем-совместимости для карточки ленты (Figma 2927-1026).
 * Полупрозрачная белая пилюля с жирным «{value}%».
 *
 * value — процент 0..100 или null/undefined (данных мало — у кого-то < 10
 * оценённых мемов) — тогда бейдж не рендерится.
 */
export default function CompatibilityBadge({ value, className = '', style }) {
  if (value === null || value === undefined) return null

  return (
    <div
      className={['center', className].filter(Boolean).join(' ')}
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        textShadow: '0px 1px 2px rgba(0,0,0,0.4)',
        ...style,
      }}
      title="Мем-совместимость"
    >
      <span className="font-extra" style={{ fontSize: 18, lineHeight: 1, letterSpacing: '-0.3px', color: 'var(--text)' }}>
        {value}%
      </span>
    </div>
  )
}
