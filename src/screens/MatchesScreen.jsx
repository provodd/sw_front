import { useState, useEffect, useRef } from 'react'
import Sticker from '../components/Sticker.jsx'
import api from '../api.js'
import TelegramIcon from '../components/icons/TelegramIcon.jsx'
import { Screen, ScreenHeader, LoadingState, VerifiedBadge, PremiumBadge } from '../components/ui'

export default function MatchesScreen({ onOpenProfile }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [lostMatchCount, setLostMatchCount] = useState(0)
  const [showLostToast, setShowLostToast] = useState(false)
  const [openMatchId, setOpenMatchId] = useState(null)

  useEffect(() => {
    api.getMatches().then(data => {
      setMatches(data.matches)
      if (data.lost_count > 0) {
        setLostMatchCount(data.lost_count)
        setShowLostToast(true)
        setTimeout(() => setShowLostToast(false), 4000)
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const openTg = (username) => {
    if (!username) return
    window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${username}`)
      || window.open(`https://t.me/${username}`, '_blank')
  }

  const deleteMatch = (matchId) => {
    setMatches(prev => prev.filter(match => match.id !== matchId))
    setOpenMatchId(null)
  }

  const markMatchViewed = (matchId) => {
    setMatches(prev => prev.map(match => {
      if (match.id !== matchId) return match
      return {
        ...match,
        is_unviewed: false,
        user: match.user ? { ...match.user, is_unviewed: false } : match.user,
        profile: match.profile ? { ...match.profile, is_unviewed: false } : match.profile,
      }
    }))
  }

  if (loading) return <LoadingState />

  return (
    <Screen withNav>
      {showLostToast && (
        <LostMatchToast count={lostMatchCount} onClose={() => setShowLostToast(false)} />
      )}
      <ScreenHeader title="МЭТЧИ" className="mb-md" />

      {matches.length === 0 ? (
        <div className="flex-1 center text-center" style={{
          flexDirection: 'column', gap: 'clamp(16px, 4vh, 32px)', padding: '0 32px',
        }}>
          <Sticker index={9} size={Math.min(194, Math.round(window.innerWidth * 0.55))} loop autoplay />
          <div className="stack-xs">
            <p className="text-body font-semi">Здесь пока пусто(</p>
            <p className="text-small text-muted" style={{ maxWidth: 280 }}>
              Продолжай свайпать, ты обязательно кому-нибудь понравишься!
            </p>
          </div>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              isOpen={openMatchId === match.id}
              onOpen={() => setOpenMatchId(match.id)}
              onClose={() => setOpenMatchId(null)}
              onDelete={() => deleteMatch(match.id)}
              onOpenTg={openTg}
              onOpenProfile={onOpenProfile}
              onViewed={() => markMatchViewed(match.id)}
            />
          ))}
        </div>
      )}
    </Screen>
  )
}

function MatchCard({ match, isOpen, onOpen, onClose, onDelete, onOpenTg, onOpenProfile, onViewed }) {
  const user = match.user || match
  const pointerStart = useRef(null)
  const [dragOffset, setDragOffset] = useState(0)

  const openProfile = (event) => {
    event.stopPropagation()
    const profile = match.user || match.profile || user
    onViewed?.()
    onOpenProfile?.({
      ...profile,
      id: profile.user_id || profile.id,
      match_id: match.id,
      is_match: true,
      photo: profile.photo || profile.photos?.[0],
      photos: profile.photos || (profile.photo ? [profile.photo] : undefined),
    })
  }

  const handlePointerDown = (event) => {
    if (event.button !== 0) return
    pointerStart.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!pointerStart.current) return
    const dx = event.clientX - pointerStart.current.x
    const dy = event.clientY - pointerStart.current.y
    if (Math.abs(dy) > Math.abs(dx)) return
    const base = isOpen ? -97 : 0
    setDragOffset(Math.max(-97, Math.min(0, base + dx)))
  }

  const finishSwipe = (event) => {
    if (!pointerStart.current) return
    const dx = event.clientX - pointerStart.current.x
    pointerStart.current = null
    setDragOffset(0)
    if (isOpen ? dx > 35 : dx > -45) onClose()
    else onOpen()
  }

  return (
    <div
      className={`match-card-swipe ${isOpen ? 'is-open' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishSwipe}
      onPointerCancel={() => { pointerStart.current = null; setDragOffset(0) }}
    >
      <article
        className="match-card card-dark"
        style={dragOffset ? { transform: `translateX(${dragOffset}px)`, transition: 'none' } : undefined}
      >
        <button
          type="button"
          className={`match-card__photo ${user.is_unviewed ? 'is-unviewed' : ''}`}
          onPointerDown={event => event.stopPropagation()}
          onClick={openProfile}
          aria-label={`Открыть профиль ${user.name}`}
        >
          <img
            src={user.photo || user.photos?.[0]}
            alt={user.name}
            loading="lazy"
            decoding="async"
          />
        </button>

        <div className="match-card__content">
          <div className="match-card__name">
            <span>
              {user.name}, {user.age}
            </span>
            {user.verified && <VerifiedBadge className="match-card__verified" />}
            {user.is_premium && <PremiumBadge size={22} />}
          </div>

          <button
            onPointerDown={event => event.stopPropagation()}
            onClick={() => onOpenTg(user.username || user.telegram_username)}
            className="match-card__message"
          >
            <TelegramIcon />
            Отправить сообщение
          </button>
        </div>

        <button
          type="button"
          className="match-card__delete"
          aria-label={`Удалить мэтч с ${user.name}`}
          onPointerDown={event => event.stopPropagation()}
          onClick={onDelete}
        >
          <TrashIcon />
        </button>
      </article>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 26" fill="none" aria-hidden="true">
      <path d="M3 7h18M9 3h6l1 4H8l1-4ZM6 7l1 16h10l1-16M10 11v8M14 11v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LostMatchToast({ count, onClose }) {
  return (
    <div
      onClick={onClose}
      className="row pointer no-select"
      style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 300, gap: 6,
        background: 'rgba(128,128,128,0.4)',
        backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 100, padding: '8px 16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <span className="emoji-sm">😭</span>
      <span className="text-caption text-tight" style={{ whiteSpace: 'nowrap' }}>
        {count > 1 ? `Вы упустили ${count} пары...` : 'Вы упустили пару...'}
      </span>
    </div>
  )
}
