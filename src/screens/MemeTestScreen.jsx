import { useState, useRef, useEffect, useCallback } from 'react'
import api from '../api.js'
import { Screen, LoadingState } from '../components/ui'

const MIN_RATED = 10 // должно совпадать с MemeCompatibility::MIN_RATED на бэке

function haptic(style = 'light') {
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style) } catch { /* noop */ }
}

/** Одна карточка-мем с drag-свайпом (влево — не смешно, вправо — смешно). */
function MemeCard({ meme, isTop, onReact }) {
  const cardRef = useRef(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const dragging = useRef(false)
  const [hint, setHint] = useState(null)

  const onPointerDown = (e) => {
    if (!isTop) return
    dragging.current = true
    startX.current = e.clientX
    startY.current = e.clientY
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragging.current || !cardRef.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    cardRef.current.style.transition = 'none'
    cardRef.current.style.transform = `translate(${dx}px, ${dy * 0.25}px) rotate(${dx * 0.06}deg)`
    setHint(Math.abs(dx) > 60 ? (dx > 0 ? 'like' : 'dislike') : null)
  }

  const onPointerUp = (e) => {
    if (!dragging.current || !cardRef.current) return
    dragging.current = false
    const dx = e.clientX - startX.current

    if (Math.abs(dx) > 100) {
      const dir = dx > 0 ? 'like' : 'dislike'
      cardRef.current.style.transition = 'transform 0.4s ease'
      cardRef.current.style.transform = `translateX(${dx > 0 ? 700 : -700}px) rotate(${dx > 0 ? 30 : -30}deg)`
      setTimeout(() => onReact(dir), 380)
    } else {
      cardRef.current.style.transition = 'transform 0.3s ease'
      cardRef.current.style.transform = 'translate(0,0) rotate(0deg)'
      setHint(null)
    }
  }

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="overflow-hidden center"
      style={{
        position: 'absolute', inset: 0,
        borderRadius: 20, background: '#000',
        touchAction: 'none', cursor: isTop ? 'grab' : 'default',
        willChange: 'transform',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      }}
    >
      <img
        src={meme.url}
        alt="meme"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
      />

      {hint === 'like' && (
        <div className="text-h2" style={{ position: 'absolute', top: 24, right: 18, border: '3px solid var(--success)', borderRadius: 8, padding: '4px 12px', color: 'var(--success)', transform: 'rotate(15deg)', background: 'rgba(0,0,0,0.35)' }}>😂</div>
      )}
      {hint === 'dislike' && (
        <div className="text-h2" style={{ position: 'absolute', top: 24, left: 18, border: '3px solid var(--error)', borderRadius: 8, padding: '4px 12px', color: 'var(--error)', transform: 'rotate(-15deg)', background: 'rgba(0,0,0,0.35)' }}>😑</div>
      )}
    </div>
  )
}

export default function MemeTestScreen({ onClose, onDone }) {
  const [memes, setMemes] = useState([])
  const [idx, setIdx] = useState(0)
  const [rated, setRated] = useState(0)
  const [total, setTotal] = useState(0)
  const [seenBefore, setSeenBefore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    api.getMemes()
      .then(data => {
        const list = data.memes || []
        setMemes(list)
        setRated(data.rated_count || 0)
        setTotal(data.total || 0)
        setSeenBefore(Math.max(0, (data.total || 0) - list.length))
        if (list.length === 0) setDone(true)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const react = useCallback((reaction) => {
    const meme = memes[idx]
    if (!meme) return
    haptic(reaction === 'like' ? 'medium' : 'light')
    if (reaction !== 'skip') setRated(r => r + 1)
    api.reactMeme(meme.id, reaction).catch(console.error)

    const ni = idx + 1
    setIdx(ni)
    if (ni >= memes.length) setDone(true)
  }, [memes, idx])

  const finish = () => { onDone ? onDone() : onClose?.() }

  if (loading) return <LoadingState />

  const top = memes[idx]
  const next = memes[idx + 1]
  const current = Math.min(seenBefore + idx + 1, total)
  const progress = total > 0 ? `${String(current).padStart(2, '0')}/${total}` : ''

  return (
    <Screen variant="gradient" scroll={false} style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      {/* Хедер */}
      <div className="text-center shrink-0" style={{ padding: 'clamp(44px, 7vh, 68px) 0 clamp(10px, 2vh, 18px)' }}>
        <span className="text-h3 font-extra text-tight">СВАЙПИК</span>
      </div>

      {done ? (
        <div className="flex-1 center">
          <div className="stack-md center text-center" style={{ padding: '0 32px' }}>
            <div className="emoji-xl">🎉</div>
            <p className="text-h2 font-bold">Мем-тест пройден!</p>
            <p className="text-small text-muted" style={{ maxWidth: 280 }}>
              {rated >= MIN_RATED
                ? 'Теперь мы покажем твою мем-совместимость с другими в ленте и профилях.'
                : `Оцени хотя бы ${MIN_RATED} мемов, чтобы открыть совместимость. Новые мемы добавляются регулярно!`}
            </p>
            <button className="btn-dark mt-xs" onClick={finish}>Отлично!</button>
          </div>
        </div>
      ) : (
        <>
          {/* Подзаголовок + прогресс */}
          <div className="row-between px-gutter shrink-0" style={{ alignItems: 'center', gap: 16 }}>
            <p className="text-small font-extra text-tight leading-snug">
              Посчитаем совместимость<br />на основе ваших любимых мемов
            </p>
            <span className="font-extra text-tight" style={{ fontSize: 'clamp(20px, 6vw, 25px)', whiteSpace: 'nowrap' }}>
              {progress}
            </span>
          </div>

          {/* Колода */}
          <div className="flex-1 relative overflow-hidden" style={{ margin: 'clamp(20px, 5vh, 40px) var(--gutter)' }}>
            {next && (
              <div className="overflow-hidden center" style={{
                position: 'absolute', inset: 0, borderRadius: 20, background: '#000',
                transform: 'scale(0.95) translateY(10px)', opacity: 0.5,
              }}>
                <img src={next.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
              </div>
            )}
            {top && <MemeCard key={top.id} meme={top} isTop onReact={react} />}
          </div>

          {/* Кнопки 😑 / 😂 */}
          <div className="row shrink-0" style={{ justifyContent: 'center', gap: 30, alignItems: 'center', padding: '4px 0 6px' }}>
            <button onClick={() => react('dislike')} aria-label="Не смешно" className="center" style={{ width: 130, height: 40, borderRadius: 22, background: '#000', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 24, lineHeight: 1 }}>😑</span>
            </button>
            <button onClick={() => react('like')} aria-label="Смешно" className="center" style={{ width: 130, height: 40, borderRadius: 22, background: '#000', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 24, lineHeight: 1 }}>😂</span>
            </button>
          </div>

          {/* Пройти позже */}
          <button onClick={finish} className="btn-ghost text-body mx-auto shrink-0" style={{ display: 'block', padding: '12px 0 max(20px, env(safe-area-inset-bottom, 20px))' }}>
            Пройти позже
          </button>
        </>
      )}
    </Screen>
  )
}
