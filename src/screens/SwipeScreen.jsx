import { useState, useRef, useCallback, useEffect } from 'react'
import api from '../api.js'
import Sticker from '../components/Sticker.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import TopPush from '../components/TopPush.jsx'
import TelegramIcon from '../components/icons/TelegramIcon.jsx'
import StarIcon from '../components/icons/StarIcon.jsx'
import FiltersModal from '../modals/FiltersModal.jsx'
import SuperLikeModal from '../modals/SuperLikeModal.jsx'
import NoUndosModal from '../modals/NoUndosModal.jsx'
import { Screen, CircleIconButton, VerifiedBadge, PremiumBadge, FadeOverlay, LoadingState, CompatibilityBadge } from '../components/ui'
import { registerSwipe } from '../utils/swipeProgress.js'

const hapticError = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error')
  } catch { /* browser noop */ }
}

function SwipeCard({ user, onSwipe, isTop, onOpenProfile, onSuperLike, onUndo, onFilters, onOpenCompatibility, isPremium }) {
  const cardRef = useRef(null)
  const swipeTintRef = useRef(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const dragMoved = useRef(false)
  const isAnimatingOut = useRef(false)
  const [photoIdx, setPhotoIdx] = useState(0)

  const resetSwipeTint = () => {
    if (!swipeTintRef.current) return
    swipeTintRef.current.style.opacity = '0'
    swipeTintRef.current.classList.remove('swipe-card__tint--like', 'swipe-card__tint--dislike')
  }

  const animateSwipeOut = (dir) => {
    if (isAnimatingOut.current) return
    isAnimatingOut.current = true
    if (!cardRef.current) {
      onSwipe?.(dir, user.id)
      return
    }

    const isLike = dir === 'like'
    const exitX = isLike ? 600 : -600
    const rotate = isLike ? 30 : -30

    if (swipeTintRef.current) {
      swipeTintRef.current.classList.toggle('swipe-card__tint--like', isLike)
      swipeTintRef.current.classList.toggle('swipe-card__tint--dislike', !isLike)
      swipeTintRef.current.style.opacity = '0.82'
    }

    cardRef.current.style.transition = 'transform 0.4s ease'
    cardRef.current.style.transform = `translateX(${exitX}px) rotate(${rotate}deg)`
    window.setTimeout(() => onSwipe?.(dir, user.id), 400)
  }

  const onPointerDown = (e) => {
    if (!isTop) return
    if (isAnimatingOut.current) return
    isDragging.current = true
    dragMoved.current = false
    startX.current = e.clientX
    startY.current = e.clientY
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!isDragging.current || !cardRef.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragMoved.current = true
    const rotate = dx * 0.06
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`
    cardRef.current.style.transition = 'none'

    if (swipeTintRef.current) {
      const strength = Math.min(Math.abs(dx) / 180, 1)
      swipeTintRef.current.classList.toggle('swipe-card__tint--like', dx > 0)
      swipeTintRef.current.classList.toggle('swipe-card__tint--dislike', dx < 0)
      swipeTintRef.current.style.opacity = String(strength * 0.82)
    }
  }

  const onPointerUp = (e) => {
    if (!isDragging.current || !cardRef.current) return
    isDragging.current = false
    const dx = e.clientX - startX.current

    if (Math.abs(dx) > 100) {
      const dir = dx > 0 ? 'like' : 'dislike'
      animateSwipeOut(dir)
    } else {
      cardRef.current.style.transition = 'transform 0.35s ease'
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)'
      resetSwipeTint()

      if (!dragMoved.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const relX = (e.clientX - rect.left) / rect.width
        const photoCount = user.photos?.length || 0
        if (relX < 0.3) {
          if (photoCount > 1) setPhotoIdx(i => Math.max(i - 1, 0))
          else hapticError()
        } else if (relX > 0.7) {
          if (photoCount > 1) setPhotoIdx(i => Math.min(i + 1, photoCount - 1))
          else hapticError()
        } else {
          onOpenProfile?.(user)
        }
      }
    }
  }

  const onPointerCancel = () => {
    isDragging.current = false
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.35s ease'
      cardRef.current.style.transform = 'translateX(0) rotate(0deg)'
    }
    resetSwipeTint()
  }

  const stopDrag = e => e.stopPropagation()

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="overflow-hidden"
      style={{
        position: 'absolute', inset: '0 16px',
        borderRadius: 28,
        touchAction: 'none', cursor: isTop ? 'grab' : 'default',
        willChange: 'transform',
        background: '#111',
      }}
    >
      <img
        src={user.photos?.[photoIdx] || `https://picsum.photos/seed/${user.id}/400/600`}
        alt={user.name}
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        draggable={false}
      />

      {/* Top gradient for name readability — custom (stronger than default fade-top) */}
      <FadeOverlay
        position="top"
        height="45%"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 55%, transparent 100%)' }}
      />

      {/* Bottom gradient for buttons — custom 35% height */}
      <FadeOverlay
        position="bottom"
        height="35%"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%)' }}
      />

      <div ref={swipeTintRef} className="swipe-card__tint no-pointer" />

      {/* Город + расстояние — сверху */}
      {(user.city || user.distance) && (
        <div className="swipe-location-row row">
          {user.city && (
            <span className="swipe-city text-small text-muted truncate">
              {user.city}
            </span>
          )}
          {user.distance && (
            <div className="swipe-distance row glass-light text-caption shrink-0">
              <svg width="8" height="10" viewBox="0 0 10 13" fill="none">
                <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5C4.17 6.5 3.5 5.83 3.5 5S4.17 3.5 5 3.5 6.5 4.17 6.5 5 5.83 6.5 5 6.5z" fill="currentColor"/>
              </svg>
              {user.distance}
            </div>
          )}
        </div>
      )}

      {/* Имя, возраст + «О себе» — снизу, над кнопками */}
      <div style={{ position: 'absolute', bottom: 96, left: 20, right: 20 }}>
        <div className="row mb-2xs" style={{ gap: 8 }}>
          <span className="text-h1" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.5)' }}>
            {user.name}, {user.age}
          </span>
          {user.verified && <VerifiedBadge size={22} />}
          {user.is_premium && <PremiumBadge size={22} />}
        </div>
        {user.bio && (
          <p className="text-small" style={{
            textShadow: '0px 1px 3px rgba(0,0,0,0.6)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {user.bio}
          </p>
        )}
      </div>

      {/* Photo dots */}
      {user.photos?.length > 1 && (
        <div className="row" style={{ position: 'absolute', bottom: 12, left: 0, right: 0, justifyContent: 'center', gap: 5 }}>
          {user.photos.map((_, i) => (
            <div key={i} style={{
              width: i === photoIdx ? 20 : 7, height: 5, borderRadius: 3,
              background: i === photoIdx ? 'var(--text)' : 'rgba(255,255,255,0.45)',
              transition: 'width var(--transition-fast)',
            }} />
          ))}
        </div>
      )}

      {/* Мем-совместимость — сверху справа */}
      <CompatibilityBadge
        value={user.compatibility}
        className="swipe-compatibility-badge"
        onClick={(event) => {
          event.stopPropagation()
          onOpenCompatibility?.()
        }}
      />

      {/* Action buttons overlay */}
      {isTop && (
        <div className="row" style={{
          position: 'absolute', bottom: 30, left: 0, right: 0,
          justifyContent: 'space-between', gap: 8,
          padding: '0 clamp(14px, 4.5vw, 24px)', boxSizing: 'border-box', zIndex: 5,
        }}>
          <CircleIconButton size="clamp(46px, 12.7vw, 50px)" className="glass-light swipe-action-btn" onClick={() => onUndo?.()} ariaLabel="undo">
            <img className="swipe-action-icon" src="/icons/undo.svg" alt="undo" draggable={false} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton size="clamp(46px, 12.7vw, 50px)" className="glass-light swipe-action-btn" onClick={() => animateSwipeOut('dislike')} ariaLabel="dislike">
            <img className="swipe-action-icon" src="/icons/dislike.svg" alt="dislike" draggable={false} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton size="clamp(46px, 12.7vw, 50px)" className="glass-light swipe-action-btn" onClick={() => onSuperLike?.()} ariaLabel="superlike">
            <img className="swipe-action-icon" src="/icons/superlike.svg" alt="superlike" draggable={false} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton size="clamp(46px, 12.7vw, 50px)" className="glass-light swipe-action-btn" onClick={() => animateSwipeOut('like')} ariaLabel="like">
            <img className="swipe-action-icon" src="/icons/like.svg" alt="like" draggable={false} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton size="clamp(46px, 12.7vw, 50px)" className="glass-light swipe-action-btn" onClick={() => onFilters?.()} ariaLabel="filters">
            <img className="swipe-action-icon" src="/icons/filters.svg" alt="filters" draggable={false} onPointerDown={stopDrag} />
          </CircleIconButton>
        </div>
      )}
    </div>
  )
}

export default function SwipeScreen({ currentUser, isPremium = false, userGender, onOpenProfile, onBuyPremium, externalSwipeRequest }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [matchUser, setMatchUser] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [superLikeUser, setSuperLikeUser] = useState(null)
  const [superlikeLeft, setSuperlikeLeft] = useState(1)
  const [showNoSuperlikes, setShowNoSuperlikes] = useState(false)
  const [showNoUndos, setShowNoUndos] = useState(false)
  const [compatibilityUser, setCompatibilityUser] = useState(null)
  const [lostMatchPush, setLostMatchPush] = useState(null)
  const [filters, setFilters] = useState(() => {
    try { return JSON.parse(localStorage.getItem('swipe_filters') || '{}') } catch { return {} }
  })

  useEffect(() => { loadFeed() }, [])

  async function loadFeed(newFilters) {
    const f = newFilters ?? filters
    try {
      setLoading(true)
      setIsEmpty(false)
      const data = await api.getFeed(f.distance || 50, f)
      if (data.users.length === 0) setIsEmpty(true)
      else setUsers(data.users)
    } catch (e) {
      console.error(e)
      setIsEmpty(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = useCallback(async (dir, userId, message) => {
    try {
      const result = await api.swipe(userId, dir, message)
      registerSwipe()
      setSuperlikeLeft(result.superlike_left ?? superlikeLeft)
      if (result.is_match) {
        setMatchUser(result.match_user)
        return
      }
      if (result.lost_match) {
        setLostMatchPush({
          id: `${userId}-${Date.now()}`,
          title: 'Вы упустили пару...',
        })
      }
    } catch (e) {
      if (e.message?.includes('Лимит суперлайков')) {
        setShowNoSuperlikes(true)
        return
      }
      console.error(e)
    }
    setUsers(prev => {
      const next = prev.filter(u => u.id !== userId)
      if (next.length === 0) setIsEmpty(true)
      return next
    })
  }, [superlikeLeft])

  useEffect(() => {
    if (!externalSwipeRequest?.userId || !externalSwipeRequest?.type) return
    handleSwipe(externalSwipeRequest.type, externalSwipeRequest.userId, externalSwipeRequest.message)
  }, [externalSwipeRequest, handleSwipe])

  const handleUndo = async () => {
    if (!isPremium) { setShowNoUndos(true); return }
    try {
      const result = await api.undoSwipe()
      if (result.return_user) {
        setUsers(prev => [...prev, result.return_user])
        setIsEmpty(false)
      }
    } catch {
      setShowNoUndos(true)
    }
  }

  const handleApplyFilters = (newFilters) => {
    localStorage.setItem('swipe_filters', JSON.stringify(newFilters))
    setFilters(newFilters)
    setShowFilters(false)
    loadFeed(newFilters)
  }

  const closeMatch = () => {
    if (matchUser) {
      setUsers(prev => {
        const next = prev.filter(u => u.id !== matchUser.id)
        if (next.length === 0) setIsEmpty(true)
        return next
      })
      setMatchUser(null)
    }
  }

  const topUser = users[users.length - 1]
  const secondUser = users[users.length - 2]

  return (
    <Screen withNav scroll={false}>
      <TopPush
        key={lostMatchPush?.id}
        open={Boolean(lostMatchPush)}
        onClose={() => setLostMatchPush(null)}
      >
        <div className="lost-match-push__content">
          <span className="lost-match-push__emoji" aria-hidden="true">😭</span>
          <span className="lost-match-push__title">{lostMatchPush?.title}</span>
        </div>
      </TopPush>

      <div className="swipe-screen-header text-center shrink-0">
        <span className="text-h3 font-extra text-wider">СВАЙПИК</span>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute-fill center">
            <Sticker index={0} size={100} />
          </div>
        ) : isEmpty ? (
          <EmptySearch onReload={() => loadFeed()} />
        ) : (
          <>
            {secondUser && (
              <div className="overflow-hidden" style={{
                position: 'absolute', inset: '0 16px 12px', borderRadius: 28,
                transform: 'scale(0.95) translateY(10px)', opacity: 0.6,
              }}>
                <img src={secondUser.photos?.[0]} alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {topUser && (
              <SwipeCard
                key={topUser.id}
                user={topUser}
                onSwipe={handleSwipe}
                isTop={true}
                onOpenProfile={onOpenProfile}
                onSuperLike={() => {
                  if (superlikeLeft <= 0) { setShowNoSuperlikes(true); return }
                  setSuperLikeUser(topUser)
                }}
                onUndo={handleUndo}
                onFilters={() => setShowFilters(true)}
                onOpenCompatibility={() => setCompatibilityUser(topUser)}
                isPremium={isPremium}
              />
            )}
          </>
        )}
      </div>

      {matchUser && <MatchModal user={matchUser} onClose={closeMatch} />}

      {showFilters && (
        <FiltersModal
          isPremium={isPremium}
          userGender={userGender}
          initialFilters={filters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          onBuyPremium={onBuyPremium}
        />
      )}

      {superLikeUser && (
        <SuperLikeModal
          user={superLikeUser}
          superlikeLeft={superlikeLeft}
          onClose={() => setSuperLikeUser(null)}
          onSend={(user, msg) => { setSuperLikeUser(null); handleSwipe('super', user.id, msg) }}
        />
      )}

      {showNoSuperlikes && (
        <NoSuperlikesModal
          isPremium={isPremium}
          onClose={() => setShowNoSuperlikes(false)}
          onBuyPremium={() => { setShowNoSuperlikes(false); onBuyPremium?.() }}
        />
      )}

      {showNoUndos && (
        <NoUndosModal
          onClose={() => setShowNoUndos(false)}
          onBuyPremium={() => { setShowNoUndos(false); onBuyPremium?.() }}
        />
      )}

      {compatibilityUser && (
        <CompatibilitySheet
          currentUser={currentUser}
          viewedUser={compatibilityUser}
          onClose={() => setCompatibilityUser(null)}
        />
      )}
    </Screen>
  )
}

export function CompatibilitySheet({ currentUser, viewedUser, onClose }) {
  const ownProfile = currentUser?.profile || currentUser
  const ownPhotos = (ownProfile?.photos || []).map(photo => photo?.url || photo).filter(Boolean)
  const ownPhoto = ownPhotos[0] || ownProfile?.photo
  const ownPhotoFallback = ownPhotos[1] || ownProfile?.photo
  const viewedPhoto = viewedUser?.photos?.[0] || viewedUser?.photo
  const compatibility = Number(viewedUser?.compatibility || 0)
  const compatibilityLevel = compatibility < 45
    ? {
        message: 'Зубы есть, и ладно',
        image: '/images/compatibility-low.png',
        imageAlt: 'Низкая совместимость',
      }
    : compatibility > 65
      ? {
          message: 'Ни в чем себе не отказывайте',
          image: '/images/compatibility-high.png',
          imageAlt: 'Высокая совместимость',
        }
      : {
          message: 'Сомнительно, но окэй',
          image: '/images/compatibility-medium.png',
          imageAlt: 'Средняя совместимость',
        }

  return (
    <BottomSheet onClose={onClose} className="compatibility-sheet">
      {closeSheet => (
        <div className="compatibility-sheet__content center">
          <div className="compatibility-sheet__profiles row">
            <div className="compatibility-sheet__profile compatibility-sheet__profile--own overflow-hidden">
              <img
                src={ownPhoto}
                alt="Ваш профиль"
                onError={(event) => {
                  if (ownPhotoFallback && event.currentTarget.src !== ownPhotoFallback) {
                    event.currentTarget.src = ownPhotoFallback
                  }
                }}
              />
            </div>
            <div className="compatibility-sheet__profile compatibility-sheet__profile--viewed overflow-hidden">
              <img src={viewedPhoto} alt={viewedUser?.name || 'Просматриваемый профиль'} />
            </div>
          </div>

          <div className="compatibility-sheet__score center">
            Мем-совместимость {compatibility}%
          </div>
          <p className="compatibility-sheet__message text-body text-center">
            {compatibilityLevel.message}
          </p>

          <img
            className="compatibility-sheet__illustration"
            src={compatibilityLevel.image}
            alt={compatibilityLevel.imageAlt}
          />

          <button type="button" onClick={closeSheet} className="btn-ghost compatibility-sheet__close">
            Закрыть
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

function EmptySearch({ onReload }) {
  const [range, setRange] = useState(11)
  return (
    <div className="absolute-fill stack-md center" style={{ padding: '0 32px' }}>
      <Sticker index={2} size={120} />
      <h3 className="text-h2 font-bold text-center">Люди рядом закончились(</h3>
      <p className="text-small text-muted text-center">Измени фильтры или увеличь диапазон поиска</p>
      <div className="full-w mt-xs">
        <div className="row-between mb-xs text-small text-muted">
          <span>Расстояние:</span><span>0-{range} км</span>
        </div>
        <input
          type="range" min={1} max={100} value={range}
          onChange={e => setRange(Number(e.target.value))}
          className="app-range full-w"
          style={{
            '--range-progress': `${range}%`,
            '--range-inactive': '#CCCCCC',
          }}
        />
      </div>
      <button className="btn-dark empty-search__apply" onClick={() => {
        localStorage.setItem('swipe_filters', JSON.stringify({ distance: range }))
        onReload()
      }}>Применить</button>
    </div>
  )
}

function MatchModal({ user, onClose }) {
  const openTg = () => {
    if (user.username) {
      try { window.Telegram?.WebApp?.openTelegramLink(`https://t.me/${user.username}`) }
      catch { window.open(`https://t.me/${user.username}`, '_blank') }
    }
    onClose()
  }

  return (
    <Screen variant="gradient" className="match-modal">
      <h1 className="match-modal__title text-display font-bold text-tight text-center">
        ЭТО ВЗАИМНО!!!
      </h1>

      <div className="match-modal__photo overflow-hidden shrink-0">
        <img src={user.photo} alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <FadeOverlay position="bottom" height="45%" />
        <div style={{ position: 'absolute', bottom: 16, left: 18 }}>
          <span className="text-h2">{user.name}{user.age ? `, ${user.age}` : ''}</span>
        </div>
        <div style={{ position: 'absolute', bottom: -16, right: -16, pointerEvents: 'none' }}>
          <Sticker index={3} size={Math.round(Math.min(window.innerWidth * 0.35, 145))} />
        </div>
      </div>

      <div className="match-modal__actions stack-sm full-w">
        <button onClick={openTg} className="match-modal__message btn-tg font-bold">
          <TelegramIcon className="match-modal__send-icon" /> Отправить сообщение
        </button>
        <button onClick={onClose} className="btn-dark">
          Свайпать дальше!
        </button>
      </div>
    </Screen>
  )
}

function ShopRow({ label, price, onClick }) {
  return (
    <button type="button" onClick={onClick} className="no-undos-sheet__plan row-between full-w">
      <span>{label}</span>
      <span className="no-undos-sheet__price">
        {price}
        <ShopStar />
      </span>
    </button>
  )
}

function ShopStar() {
  return <StarIcon className="no-undos-sheet__star" />
}

function NoSuperlikesModal({ onClose, onBuyPremium, isPremium }) {
  const handleBuy = async (count, closeSheet) => {
    try {
      const data = await api.purchaseSuperlikes(count)
      if (data.invoice_url) {
        window.Telegram?.WebApp?.openInvoice?.(data.invoice_url, status => {
          if (status === 'paid') closeSheet()
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <BottomSheet onClose={onClose} className="no-superlikes-sheet">
      {closeSheet => (
      <div className="no-undos-sheet__content no-superlikes-sheet__content center">
        <Sticker index={1} size={159} />
        <h2 className="no-undos-sheet__title text-h1 text-center">
          Суперлайки закончились(
        </h2>
        <p className="no-superlikes-sheet__description text-body text-center text-muted">
          Новые будут доступны через:
        </p>
        <div className="no-superlikes-sheet__timer text-body">
          <SuperlikeTimer />
        </div>
        {!isPremium && (
          <button onClick={onBuyPremium} className="no-undos-sheet__premium btn-dark">
            Получить больше с Premium
          </button>
        )}
        <span className="no-undos-sheet__separator text-body text-muted">или купить их отдельно</span>
        <div className="no-undos-sheet__plans full-w">
          <ShopRow label="1 суперлайк" price={40} onClick={() => handleBuy(1, closeSheet)} />
          <ShopRow label="5 суперлайков" price={70} onClick={() => handleBuy(5, closeSheet)} />
          <ShopRow label="10 суперлайков" price={100} onClick={() => handleBuy(10, closeSheet)} />
        </div>
        <button onClick={closeSheet} className="no-undos-sheet__close btn-ghost text-body">
          Закрыть
        </button>
      </div>
      )}
    </BottomSheet>
  )
}

function SuperlikeTimer() {
  const [display, setDisplay] = useState(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const diff = Math.max(0, Math.floor((midnight - now) / 1000))
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    return `${h}ч ${m} мин`
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = Math.max(0, Math.floor((midnight - now) / 1000))
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      setDisplay(`${h}ч ${m} мин`)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return <span>{display}</span>
}
