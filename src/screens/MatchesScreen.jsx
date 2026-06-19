import { useState, useEffect } from 'react'
import Sticker from '../components/Sticker.jsx'
import api from '../api.js'
import { Screen, ScreenHeader, GlassCard, LoadingState, VerifiedBadge } from '../components/ui'

export default function MatchesScreen() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [lostMatchCount, setLostMatchCount] = useState(0)
  const [showLostToast, setShowLostToast] = useState(false)

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
        <div className="stack-xs" style={{ padding: '0 var(--gutter) 16px' }}>
          {matches.map(match => (
            <MatchCard key={match.id} match={match} onOpenTg={openTg} />
          ))}
        </div>
      )}
    </Screen>
  )
}

function MatchCard({ match, onOpenTg }) {
  const user = match.user || match
  return (
    <GlassCard className="row" style={{
      borderRadius: 35, padding: 10, gap: 12,
    }}>
      <div className="overflow-hidden shrink-0" style={{
        width: 82, height: 82, borderRadius: '50%',
        background: '#333',
        border: user.is_online ? '2.8px solid #00b000' : 'none',
      }}>
        <img
          src={user.photo || user.photos?.[0]}
          alt={user.name}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div className="flex-1">
        <div className="row mb-2xs" style={{ gap: 6 }}>
          <span className="text-h2" style={{ whiteSpace: 'nowrap' }}>
            {user.name}, {user.age}
          </span>
          {user.verified && <VerifiedBadge size={16} style={{ borderRadius: 5 }} />}
        </div>

        <button
          onClick={() => onOpenTg(user.username || user.telegram_username)}
          className="btn-tg font-bold"
          style={{ padding: '10px 16px' }}
        >
          <TgIcon />
          Отправить сообщение
        </button>
      </div>
    </GlassCard>
  )
}

function TgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
