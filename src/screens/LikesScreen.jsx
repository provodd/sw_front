import { useState, useEffect } from 'react'
import api from '../api.js'
import { Screen, ScreenHeader, EmptyState, LoadingState, VerifiedBadge, PremiumBadge, FadeOverlay } from '../components/ui'
import { getSwipeProgress, registerSwipe, SWIPES_TO_UNLOCK_LIKES } from '../utils/swipeProgress.js'

export default function LikesScreen({ onBuyPremium, onOpenProfile, onGoSearch }) {
  const [likes, setLikes] = useState([])
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [swipeProgress, setSwipeProgress] = useState(getSwipeProgress)
  const [isCounterShaking, setIsCounterShaking] = useState(false)

  useEffect(() => {
    api.getLikes().then(data => {
      setLikes(data.likes)
      setIsPremium(data.is_premium)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const update = event => setSwipeProgress(event.detail ?? getSwipeProgress())
    window.addEventListener('swaypik:swipe-progress', update)
    return () => window.removeEventListener('swaypik:swipe-progress', update)
  }, [])

  const handleAction = async (like, action) => {
    try {
      await api.swipe(like.user_id, action)
      registerSwipe()
      setLikes(prev => prev.filter(l => l.user_id !== like.user_id))
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <LoadingState />

  const topLike = likes[0]
  const restLikes = likes.slice(1)
  const remainingSwipes = Math.max(0, SWIPES_TO_UNLOCK_LIKES - swipeProgress)
  const likesUnlocked = isPremium || remainingSwipes === 0
  const openLikeProfile = (like) => {
    onOpenProfile?.({
      ...like,
      id: like.user_id || like.id,
      from_likes: true,
      is_liker: true,
      photos: like.photos || (like.photo ? [like.photo] : undefined),
    })
  }
  const nudgeUnlockCounter = () => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error')
    } catch { /* browser noop */ }
    setIsCounterShaking(false)
    window.requestAnimationFrame(() => setIsCounterShaking(true))
  }

  return (
    <Screen withNav>
      <ScreenHeader title="ЛАЙКИ" className="mb-md" />

      {likes.length === 0 ? (
        <EmptyState
          emoji="💔"
          title="Пока никто не лайкнул"
          description="Свайпай и жди взаимности!"
        />
      ) : (
        <div className="stack-sm" style={{ padding: '0 var(--gutter)' }}>
          {topLike && (
            <TopLikeCard
              like={topLike}
              onAccept={() => handleAction(topLike, 'like')}
              onReject={() => handleAction(topLike, 'dislike')}
              onOpen={() => openLikeProfile(topLike)}
            />
          )}

          {restLikes.length > 0 && (
            likesUnlocked ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {restLikes.map((like, i) => (
                  <LikeCard
                    key={i}
                    like={like}
                    onAccept={() => handleAction(like, 'like')}
                    onReject={() => handleAction(like, 'dislike')}
                    onOpen={() => openLikeProfile(like)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {restLikes.map((like, i) => (
                  <BlurredCard key={i} like={like} onTap={nudgeUnlockCounter} />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {!likesUnlocked && restLikes.length > 0 && (
        <div className="likes-unlock-cta">
          <button
            onClick={onGoSearch}
            onAnimationEnd={() => setIsCounterShaking(false)}
            className={`btn-dark ${isCounterShaking ? 'is-shaking' : ''}`}
          >
            Лайки откроются через {remainingSwipes} свайпов
          </button>
        </div>
      )}

    </Screen>
  )
}

function TopLikeCard({ like, onAccept, onReject, onOpen }) {
  return (
    <div className="top-like-card overflow-hidden relative pointer" onClick={onOpen}>
      <img src={like.photo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <FadeOverlay position="bottom" height="60%" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />

      {like.type === 'super' && (
        <img className="top-like-card__superlike" src="/icons/superlike.svg" alt="Суперлайк" />
      )}

      <div className="top-like-card__copy">
        <div className="row mb-2xs" style={{ gap: 6 }}>
          <span className="text-h2" style={{ textShadow: '0px 3px 2px rgba(0,0,0,0.25)' }}>
            {like.name}, {like.age}
          </span>
          {like.verified && <VerifiedBadge size={22} />}
          {like.is_premium && <PremiumBadge size={22} />}
        </div>
        {like.bio && (
          <p className="text-small text-muted leading-snug" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>
            {like.bio}
          </p>
        )}
      </div>

      <div className="top-like-card__actions row" onClick={e => e.stopPropagation()}>
        <button onClick={onReject} className="like-card__action glass-light flex-1 center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button onClick={onAccept} className="like-card__action glass-light flex-1 center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function BlurredCard({ like, onTap }) {
  return (
    <div onClick={onTap} className="relative overflow-hidden pointer" style={{ height: 250, borderRadius: 30, background: '#111' }}>
      <img src={like.photo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(9px)', transform: 'scale(1.1)' }} />
    </div>
  )
}

function LikeCard({ like, onAccept, onReject, onOpen }) {
  return (
    <div className="like-card relative overflow-hidden pointer" onClick={onOpen}>
      <img src={like.photo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <FadeOverlay position="bottom" height="55%" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
      <div className="like-card__name">
        <span className="text-small font-bold">{like.name}, {like.age}</span>
      </div>
      <div className="like-card__actions row" onClick={e => e.stopPropagation()}>
        <button onClick={onReject} className="like-card__action glass-light flex-1 center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button onClick={onAccept} className="like-card__action glass-light flex-1 center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
