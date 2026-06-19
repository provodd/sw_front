import { useState, useEffect } from 'react'
import api from '../api.js'
import { Screen, CircleIconButton, LoadingState, VerifiedBadge, FadeOverlay, Chip, CompatibilityBadge } from '../components/ui'

export default function UserProfileScreen({ userId, onBack, onSwipe }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [revealPrice, setRevealPrice] = useState(1)
  const [revealed, setRevealed] = useState(null)
  const [revealing, setRevealing] = useState(false)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      api.getUserProfile(userId),
      api.getRevealPrice(userId),
    ]).then(([profileData, priceData]) => {
      setUser(profileData.user)
      setRevealPrice(priceData.price ?? 1)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  const openTg = (username) => {
    try { window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${username}`) }
    catch { window.open(`https://t.me/${username}`, '_blank') }
  }

  const handleReveal = async () => {
    if (revealed) { openTg(revealed); return }
    setRevealing(true)
    try {
      const data = await api.revealContact(userId)
      setRevealed(data.username)
      openTg(data.username)
    } catch (e) {
      alert(e.message || 'Недостаточно монет')
    } finally {
      setRevealing(false)
    }
  }

  const handleSwipe = async (type) => {
    setSwiping(true)
    try {
      await onSwipe?.(type, userId)
      onBack()
    } catch (e) {
      console.error(e)
    } finally {
      setSwiping(false)
    }
  }

  if (loading) {
    return (
      <Screen style={{ background: '#0d0020', zIndex: 300 }}>
        <LoadingState />
      </Screen>
    )
  }

  if (!user) return null

  const photos = user.photos || []

  return (
    <Screen style={{ zIndex: 300 }}>
      <div className="stack-md center" style={{ paddingBottom: 48, gap: 15 }}>

        {/* Photo frame */}
        <div className="relative overflow-hidden shrink-0 full-w" style={{ height: 522, borderRadius: '40px 40px 0 0' }}>

          <img
            src={photos[photoIdx] || `https://picsum.photos/seed/${user.id}/400/600`}
            alt=""
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <FadeOverlay position="top" height="45%" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)' }} />
          <FadeOverlay position="bottom" height="28%" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />

          {/* Back button */}
          <CircleIconButton
            size={36}
            onClick={onBack}
            ariaLabel="Назад"
            style={{
              position: 'absolute', top: 20, left: 16, zIndex: 3,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <span className="emoji-sm" style={{ color: 'var(--text)' }}>←</span>
          </CircleIconButton>

          {/* Name + badges */}
          <div className="row" style={{
            position: 'absolute', top: 28, left: 0, right: 0,
            justifyContent: 'center', gap: 9, zIndex: 2,
            paddingLeft: 52, paddingRight: 16,
          }}>
            <span className="text-h1" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
              {user.name}, {user.age}
            </span>
            {user.verified && <VerifiedBadge size={25} />}
            {user.city && (
              <div className="row shrink-0 text-caption" style={{
                gap: 3,
                background: 'rgba(128,128,128,0.3)',
                backdropFilter: 'blur(50px)', WebkitBackdropFilter: 'blur(50px)',
                border: '1.4px solid rgba(255,255,255,0.4)',
                borderRadius: 10, padding: '4px 8px',
              }}>
                <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                  <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5zm0 6.5c-.83 0-1.5-.67-1.5-1.5S4.17 3.5 5 3.5 6.5 4.17 6.5 5 5.83 6.5 5 6.5z"/>
                </svg>
                {user.city}
              </div>
            )}
          </div>

          {/* Photo tap zones */}
          <div onClick={() => setPhotoIdx(i => Math.max(i - 1, 0))} style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '75%', zIndex: 1 }} />
          <div onClick={() => setPhotoIdx(i => Math.min(i + 1, photos.length - 1))} style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '75%', zIndex: 1 }} />

          {/* Photo dots */}
          {photos.length > 1 && (
            <div className="row" style={{ position: 'absolute', bottom: 52, left: 0, right: 0, justifyContent: 'center', gap: 6, zIndex: 2 }}>
              {photos.map((_, i) => (
                <div key={i} style={{
                  width: i === photoIdx ? 16 : 8, height: 8, borderRadius: 4,
                  background: i === photoIdx ? 'var(--text)' : 'rgba(255,255,255,0.4)',
                  transition: 'all var(--transition)',
                }} />
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="row" style={{
            position: 'absolute', bottom: 30, left: 0, right: 0,
            justifyContent: 'center', gap: 22, zIndex: 2,
          }}>
            <CircleIconButton onClick={() => handleSwipe('dislike')} ariaLabel="dislike" style={{ opacity: swiping ? 0.6 : 1 }}>
              <img src="/icons/dislike.svg" width={28} height={28} alt="dislike" draggable={false} style={{ objectFit: 'contain' }} />
            </CircleIconButton>
            <CircleIconButton onClick={() => handleSwipe('superlike')} ariaLabel="superlike" style={{ opacity: swiping ? 0.6 : 1 }}>
              <img src="/icons/superlike.svg" width={28} height={28} alt="superlike" draggable={false} style={{ objectFit: 'contain' }} />
            </CircleIconButton>
            <CircleIconButton onClick={() => handleSwipe('like')} ariaLabel="like" style={{ opacity: swiping ? 0.6 : 1 }}>
              <img src="/icons/like.svg" width={28} height={28} alt="like" draggable={false} style={{ objectFit: 'contain' }} />
            </CircleIconButton>
          </div>
        </div>

        {/* Content */}
        <div className="stack-lg full-w" style={{ padding: '0 16px', boxSizing: 'border-box' }}>

          {user.compatibility != null && (
            <div className="center mx-auto" style={{
              minHeight: 45, padding: '8px 16px', borderRadius: 'var(--radius-pill)',
              background: 'rgba(255,255,255,0.1)',
            }}>
              <span className="text-body font-bold">Мем-совместимость {user.compatibility}%</span>
            </div>
          )}

          {user.bio && (
            <>
              <p className="text-tight text-faint text-body">О себе</p>
              <div style={{
                borderRadius: 20, padding: '12px 16px', minHeight: 70,
                background: 'linear-gradient(90deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(90deg, rgba(51,51,51,0.35), rgba(51,51,51,0.35))',
                boxShadow: 'inset 0px -0.5px 1px rgba(255,255,255,0.25), inset 1px 1.5px 4px rgba(0,0,0,0.1)',
              }}>
                <p className="text-tight text-body" style={{ textShadow: '0px 2px 1.8px rgba(0,0,0,0.25)' }}>
                  {user.bio}
                </p>
              </div>
            </>
          )}

          {user.interests?.length > 0 && (
            <>
              <p className="text-tight text-faint text-body">Интересы</p>
              <div className="cluster-md">
                {user.interests.map(int => <Chip key={int} variant="pink">{int}</Chip>)}
              </div>
            </>
          )}

          {(user.zodiac || user.height || user.kids || user.alcohol || user.smoke) && (
            <>
              <p className="text-tight text-faint text-body">Основное</p>
              <div className="cluster-md">
                {user.height && <Chip variant="pink">{`${user.height} см`}</Chip>}
                {user.zodiac && <Chip variant="pink">{user.zodiac}</Chip>}
                {user.kids && <Chip variant="pink">{user.kids}</Chip>}
                {user.alcohol && <Chip variant="pink">{user.alcohol}</Chip>}
                {user.smoke && <Chip variant="pink">{user.smoke}</Chip>}
              </div>
            </>
          )}

          {user.achievements?.length > 0 && (
            <>
              <p className="text-tight text-faint text-body">Ачивки</p>
              <div className="cluster-sm">
                {user.achievements.map(a => (
                  <div key={a.key} title={a.title} className="center emoji-md" style={{
                    width: 65, height: 65, borderRadius: 16,
                    background: `linear-gradient(154deg, ${a.color}cc 19%, ${a.color} 111%)`,
                  }}>{a.icon}</div>
                ))}
              </div>
            </>
          )}

          {user.username && (
            <button onClick={handleReveal} disabled={revealing} className="row center full-w text-body font-bold" style={{
              height: 52, borderRadius: 51,
              background: revealed ? 'linear-gradient(135deg, #229ED9, #1E90FF)' : 'rgba(34,158,217,0.15)',
              border: revealed ? 'none' : '1.5px solid rgba(34,158,217,0.5)',
              cursor: 'pointer', gap: 8,
              color: 'var(--text)', fontFamily: 'inherit',
              opacity: revealing ? 0.6 : 1,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              {revealed ? 'Написать' : `Написать · 🪙 ${revealPrice}`}
            </button>
          )}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />

          <button className="center btn-ghost text-tight text-body" style={{
            color: '#a11257', gap: 10,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a11257" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Пожаловаться
          </button>

        </div>
      </div>
    </Screen>
  )
}
