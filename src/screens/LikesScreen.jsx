import { useState, useEffect } from 'react'
import api from '../api.js'
import BottomSheet from '../components/BottomSheet.jsx'
import Sticker from '../components/Sticker.jsx'
import { Screen, ScreenHeader, EmptyState, LoadingState, VerifiedBadge, FadeOverlay } from '../components/ui'

export default function LikesScreen({ onBuyPremium, onOpenProfile }) {
  const [likes, setLikes] = useState([])
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCantSeeModal, setShowCantSeeModal] = useState(false)

  useEffect(() => {
    api.getLikes().then(data => {
      setLikes(data.likes)
      setIsPremium(data.is_premium)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleAction = async (like, action) => {
    try {
      await api.swipe(like.user_id, action)
      setLikes(prev => prev.filter(l => l.user_id !== like.user_id))
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <LoadingState />

  const topLike = likes[0]
  const restLikes = likes.slice(1)

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
              onOpen={() => onOpenProfile?.(topLike)}
            />
          )}

          {restLikes.length > 0 && (
            isPremium ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {restLikes.map((like, i) => (
                  <LikeCard
                    key={i}
                    like={like}
                    onAccept={() => handleAction(like, 'like')}
                    onReject={() => handleAction(like, 'dislike')}
                    onOpen={() => onOpenProfile?.(like)}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {restLikes.map((like, i) => (
                  <BlurredCard key={i} like={like} onTap={() => setShowCantSeeModal(true)} />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {!isPremium && restLikes.length > 0 && (
        <div style={{ position: 'sticky', bottom: 16, padding: '0 var(--gutter)', marginTop: 8 }}>
          <button onClick={() => setShowCantSeeModal(true)} className="btn-dark">
            Узнайте, кто вас лайкнул
          </button>
        </div>
      )}

      {showCantSeeModal && (
        <CantSeeLikesModal
          onClose={() => setShowCantSeeModal(false)}
          onBuyPremium={() => { setShowCantSeeModal(false); onBuyPremium?.() }}
        />
      )}
    </Screen>
  )
}

function TopLikeCard({ like, onAccept, onReject, onOpen }) {
  return (
    <div className="overflow-hidden relative pointer" style={{ borderRadius: 30, height: 246 }} onClick={onOpen}>
      <img src={like.photo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <FadeOverlay position="bottom" height="60%" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />

      {like.type === 'super' && (
        <div className="emoji-md" style={{ position: 'absolute', top: 11, right: 11 }}>😍</div>
      )}

      <div style={{ position: 'absolute', bottom: 50, left: 20, right: 20 }}>
        <div className="row mb-2xs" style={{ gap: 6 }}>
          <span className="text-h2" style={{ textShadow: '0px 3px 2px rgba(0,0,0,0.25)' }}>
            {like.name}, {like.age}
          </span>
          {like.verified && <VerifiedBadge size={22} />}
        </div>
        {like.bio && (
          <p className="text-small text-muted leading-snug" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>
            {like.bio}
          </p>
        )}
      </div>

      <div className="row" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, gap: 16, padding: '0 20px 12px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onReject} className="flex-1 center" style={{
          height: 40, background: 'var(--surface-base)', border: 'none',
          borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button onClick={onAccept} className="flex-1 center" style={{
          height: 40, background: 'var(--accent-grad)', border: 'none',
          borderRadius: 40, cursor: 'pointer', fontFamily: 'inherit',
        }}>
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

function CantSeeLikesModal({ onClose, onBuyPremium }) {
  return (
    <BottomSheet onClose={onClose}>
      <div className="stack-lg center" style={{ paddingTop: 8 }}>
        <Sticker index={0} size={196} />
        <div className="text-center">
          <h2 className="text-h1 mb-lg">Кто же это...</h2>
          <p className="text-body text-muted">
            Только Premium пользователи могут видеть, кто их лайкнул
          </p>
        </div>
        <button onClick={onBuyPremium} className="btn-dark">
          Получить Premium
        </button>
        <button onClick={onClose} className="btn-ghost text-body text-muted">
          Закрыть
        </button>
      </div>
    </BottomSheet>
  )
}

function LikeCard({ like, onAccept, onReject, onOpen }) {
  return (
    <div className="relative overflow-hidden pointer" style={{ height: 250, borderRadius: 30, background: '#111' }} onClick={onOpen}>
      <img src={like.photo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <FadeOverlay position="bottom" height="55%" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 36, left: 10 }}>
        <span className="text-small font-bold">{like.name}, {like.age}</span>
      </div>
      <div className="row" style={{ position: 'absolute', bottom: 6, left: 0, right: 0, gap: 6, padding: '0 8px' }} onClick={e => e.stopPropagation()}>
        <button onClick={onReject} className="flex-1 center" style={{
          height: 32, background: 'rgba(0,0,0,0.7)', border: 'none',
          borderRadius: 30, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button onClick={onAccept} className="flex-1 center" style={{
          height: 32, background: 'var(--accent-grad)', border: 'none',
          borderRadius: 30, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
