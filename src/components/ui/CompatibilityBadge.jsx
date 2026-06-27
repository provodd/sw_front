/**
 * Бейдж мем-совместимости для карточки ленты (Figma 2927-1026).
 * Полупрозрачная белая пилюля с жирным «{value}%».
 *
 * value — процент 0..100 или null/undefined (данных мало — у кого-то < 10
 * оценённых мемов) — тогда бейдж не рендерится.
 */
export default function CompatibilityBadge({ value, className = '', style, onClick }) {
  if (value === null || value === undefined) return null

  const stopCardGesture = event => event.stopPropagation()

  return (
    <button
      type="button"
      className={['compatibility-badge', 'glass-light', 'center', className].filter(Boolean).join(' ')}
      style={style}
      title="Мем-совместимость"
      onClick={onClick}
      onPointerDown={stopCardGesture}
      onPointerMove={stopCardGesture}
      onPointerUp={stopCardGesture}
      aria-label={`Мем-совместимость ${value}%`}
    >
      <span className="compatibility-badge__value font-extra">
        {value}%
      </span>
    </button>
  )
}
