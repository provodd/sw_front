import { useState, useRef, useCallback, useEffect } from 'react'
import api from '../api.js'
import Sticker from '../components/Sticker.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import FiltersModal from '../modals/FiltersModal.jsx'
import SuperLikeModal from '../modals/SuperLikeModal.jsx'
import ReportModal from '../modals/ReportModal.jsx'
import { Screen, CircleIconButton, VerifiedBadge, FadeOverlay, LoadingState, CompatibilityBadge } from '../components/ui'

function SwipeCard({ user, onSwipe, isTop, onReport, onOpenProfile, onSuperLike, onUndo, onFilters, isPremium }) {
  const cardRef = useRef(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)
  const dragMoved = useRef(false)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [hint, setHint] = useState(null)

  const onPointerDown = (e) => {
    if (!isTop) return
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
    cardRef.current.style.transform = `translateX(${dx}px) translateY(${dy * 0.3}px) rotate(${rotate}deg)`
    cardRef.current.style.transition = 'none'
    if (Math.abs(dx) > 60) setHint(dx > 0 ? 'like' : 'dislike')
    else if (dy < -80) setHint('super')
    else setHint(null)
  }

  const onPointerUp = (e) => {
    if (!isDragging.current || !cardRef.current) return
    isDragging.current = false
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    if (Math.abs(dx) > 100) {
      const dir = dx > 0 ? 'like' : 'dislike'
      cardRef.current.style.transition = 'transform 0.4s ease'
      cardRef.current.style.transform = `translateX(${dx > 0 ? 600 : -600}px) rotate(${dx > 0 ? 30 : -30}deg)`
      setTimeout(() => onSwipe(dir, user.id), 400)
    } else if (dy < -120) {
      cardRef.current.style.transition = 'transform 0.4s ease'
      cardRef.current.style.transform = 'translateY(-800px)'
      setTimeout(() => onSwipe('super', user.id), 400)
    } else {
      cardRef.current.style.transition = 'transform 0.35s ease'
      cardRef.current.style.transform = 'translateX(0) translateY(0) rotate(0deg)'
      setHint(null)

      if (!dragMoved.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const relX = (e.clientX - rect.left) / rect.width
        if (user.photos?.length > 1 && relX < 0.3) {
          setPhotoIdx(i => Math.max(i - 1, 0))
        } else if (user.photos?.length > 1 && relX > 0.7) {
          setPhotoIdx(i => Math.min(i + 1, user.photos.length - 1))
        } else {
          onOpenProfile?.(user)
        }
      }
    }
  }

  const stopDrag = e => e.stopPropagation()

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
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

      {/* Город + расстояние — сверху */}
      {(user.city || user.distance) && (
        <div className="row" style={{ position: 'absolute', top: 22, left: 16, right: 56, gap: 8 }}>
          {user.distance && (
            <div className="row glass text-caption shrink-0" style={{
              gap: 3, borderRadius: 10, padding: '3px 8px',
              background: 'rgba(128,128,128,0.3)',
              border: '1.4px solid rgba(255,255,255,0.4)',
              backdropFilter: 'blur(50px)',
            }}>
              <svg width="8" height="10" viewBox="0 0 10 13" fill="none">
                <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5C4.17 6.5 3.5 5.83 3.5 5S4.17 3.5 5 3.5 6.5 4.17 6.5 5 5.83 6.5 5 6.5z" fill="currentColor"/>
              </svg>
              {user.distance}
            </div>
          )}
          {user.city && (
            <span className="text-small text-muted truncate" style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.6)' }}>
              {user.city}
            </span>
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

      {/* Мем-совместимость — сверху справа, слева от кнопки жалобы */}
      <CompatibilityBadge value={user.compatibility} style={{ position: 'absolute', top: 18, right: 54, zIndex: 5 }} />

      {/* Report button */}
      {isTop && (
        <button
          onClick={e => { e.stopPropagation(); onReport?.() }}
          onPointerDown={stopDrag}
          className="center text-body"
          style={{
            position: 'absolute', top: 18, right: 14,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: 32, height: 32,
            cursor: 'pointer', zIndex: 5,
            fontFamily: 'inherit',
          }}
        >⚠️</button>
      )}

      {/* Swipe hint labels */}
      {hint === 'like' && (
        <div className="text-h2" style={{ position: 'absolute', top: 50, left: 20, border: '3px solid var(--success)', borderRadius: 8, padding: '6px 14px', color: 'var(--success)', transform: 'rotate(-15deg)' }}>ЛАЙК ❤️</div>
      )}
      {hint === 'dislike' && (
        <div className="text-h2" style={{ position: 'absolute', top: 50, right: 20, border: '3px solid var(--error)', borderRadius: 8, padding: '6px 14px', color: 'var(--error)', transform: 'rotate(15deg)' }}>ПАСС 💔</div>
      )}
      {hint === 'super' && (
        <div className="text-h2" style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', border: '3px solid var(--accent)', borderRadius: 8, padding: '6px 14px', color: 'var(--accent)' }}>СУПЕР 😍</div>
      )}

      {/* Action buttons overlay */}
      {isTop && (
        <div className="row" style={{
          position: 'absolute', bottom: 30, left: 0, right: 0,
          justifyContent: 'space-between', gap: 8,
          padding: '0 clamp(14px, 4.5vw, 24px)', boxSizing: 'border-box', zIndex: 5,
        }}>
          <CircleIconButton onClick={() => onUndo?.()} style={{ opacity: !isPremium ? 0.4 : 1 }} ariaLabel="undo">
            <img src="/icons/undo.svg" width={28} height={28} alt="undo" draggable={false} style={{ objectFit: 'contain' }} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton onClick={() => onSwipe?.('dislike', user.id)} ariaLabel="dislike">
            <img src="/icons/dislike.svg" width={28} height={28} alt="dislike" draggable={false} style={{ objectFit: 'contain' }} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton onClick={() => onSuperLike?.()} ariaLabel="superlike">
            <img src="/icons/superlike.svg" width={28} height={28} alt="superlike" draggable={false} style={{ objectFit: 'contain' }} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton onClick={() => onSwipe?.('like', user.id)} ariaLabel="like">
            <img src="/icons/like.svg" width={28} height={28} alt="like" draggable={false} style={{ objectFit: 'contain' }} onPointerDown={stopDrag} />
          </CircleIconButton>
          <CircleIconButton onClick={() => onFilters?.()} ariaLabel="filters">
            <img src="/icons/filters.svg" width={28} height={28} alt="filters" draggable={false} style={{ objectFit: 'contain' }} onPointerDown={stopDrag} />
          </CircleIconButton>
        </div>
      )}
    </div>
  )
}

export default function SwipeScreen({ isPremium = false, userGender, onOpenProfile, onBuyPremium }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)
  const [matchUser, setMatchUser] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [superLikeUser, setSuperLikeUser] = useState(null)
  const [reportUser, setReportUser] = useState(null)
  const [superlikeLeft, setSuperlikeLeft] = useState(1)
  const [showNoSuperlikes, setShowNoSuperlikes] = useState(false)
  const [showNoUndos, setShowNoUndos] = useState(false)
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
      setSuperlikeLeft(result.superlike_left ?? superlikeLeft)
      if (result.is_match) {
        setMatchUser(result.match_user)
        return
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

  const handleReport = async (user, reason) => {
    try {
      await api.report(user.id, reason)
      setReportUser(null)
      setUsers(prev => {
        const next = prev.filter(u => u.id !== user.id)
        if (next.length === 0) setIsEmpty(true)
        return next
      })
    } catch (e) {
      console.error(e)
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
      <div className="text-center shrink-0" style={{ padding: 'clamp(48px, 7vh, 72px) 0 clamp(8px, 1.5vh, 14px)' }}>
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
                onReport={() => setReportUser(topUser)}
                onOpenProfile={onOpenProfile}
                onSuperLike={() => {
                  if (superlikeLeft <= 0) { setShowNoSuperlikes(true); return }
                  setSuperLikeUser(topUser)
                }}
                onUndo={handleUndo}
                onFilters={() => setShowFilters(true)}
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

      {reportUser && (
        <ReportModal
          user={reportUser}
          onClose={() => setReportUser(null)}
          onReport={handleReport}
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
    </Screen>
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
          style={{ width: '100%', accentColor: 'var(--accent)' }}
        />
      </div>
      <button className="btn-dark" onClick={() => {
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
    <Screen variant="gradient" style={{
      padding: '0 clamp(16px, 6vw, 32px)',
      zIndex: 200, alignItems: 'center',
    }}>
      <h1 className="text-display font-black text-tight text-center" style={{
        margin: 'clamp(48px, 11vh, 96px) 0 clamp(12px, 2.5vh, 24px)',
        textShadow: '0.8px 2.4px 5.3px rgba(0,0,0,0.47)',
      }}>
        ЭТО ВЗАИМНО!!!
      </h1>

      <div className="overflow-hidden shrink-0" style={{
        position: 'relative',
        width: '100%', maxWidth: 'min(340px, 87vw)',
        height: 'clamp(300px, 57vh, 490px)',
        borderRadius: 30,
      }}>
        <img src={user.photo} alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <FadeOverlay position="bottom" height="45%" />
        <div style={{ position: 'absolute', bottom: 16, left: 18 }}>
          <span className="text-h2">{user.name}</span>
        </div>
        <div style={{ position: 'absolute', bottom: -16, right: -16, pointerEvents: 'none' }}>
          <Sticker index={3} size={Math.round(Math.min(window.innerWidth * 0.35, 145))} />
        </div>
      </div>

      <div className="stack-sm full-w" style={{
        maxWidth: 'min(340px, 87vw)',
        marginTop: 'clamp(24px, 5vh, 44px)',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom, 28px))',
      }}>
        <button onClick={openTg} className="btn-tg font-bold">
          <TgIcon /> Отправить сообщение
        </button>
        <button onClick={onClose} className="btn-dark">
          Свайпать дальше!
        </button>
      </div>
    </Screen>
  )
}

function TgIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
}

function ShopRow({ label, price, onClick }) {
  return (
    <button onClick={onClick} className="row-between full-w text-body font-medium" style={{
      background: 'var(--surface-elev-1)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '14px 18px', cursor: 'pointer', fontFamily: 'inherit',
      color: 'var(--text)',
    }}>
      <span>{label}</span>
      <span className="text-gold font-bold">{price} ⭐</span>
    </button>
  )
}

function NoSuperlikesModal({ onClose, onBuyPremium, isPremium }) {
  const handleBuy = async (count) => {
    try {
      const data = await api.purchaseSuperlikes(count)
      if (data.invoice_url) {
        window.Telegram?.WebApp?.openInvoice?.(data.invoice_url, status => {
          if (status === 'paid') onClose()
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="stack-sm center">
        <Sticker index={1} size={159} />
        <h2 className="text-h1 text-center">
          Суперлайки закончились(
        </h2>
        <p className="text-body text-center text-muted">
          Новые будут доступны через:
        </p>
        <div className="glass text-body" style={{ padding: '5px 20px', borderRadius: 30 }}>
          <SuperlikeTimer />
        </div>
        {!isPremium && (
          <button onClick={onBuyPremium} className="btn-dark mt-xs">
            Получить больше с Premium
          </button>
        )}
        <span className="text-body text-muted">или купить их отдельно</span>
        <div className="stack-xs full-w mb-2xs">
          <ShopRow label="Купить 1 суперлайк" price={30} onClick={() => handleBuy(1)} />
          <ShopRow label="Купить 5 суперлайков" price={150} onClick={() => handleBuy(5)} />
          <ShopRow label="Купить 10 суперлайков" price={300} onClick={() => handleBuy(10)} />
        </div>
        <button onClick={onClose} className="btn-ghost text-body text-muted">
          Закрыть
        </button>
      </div>
    </BottomSheet>
  )
}

function NoUndosModal({ onClose, onBuyPremium }) {
  const handleBuy = async (count) => {
    try {
      const data = await api.purchaseUndos(count)
      if (data.invoice_url) {
        window.Telegram?.WebApp?.openInvoice?.(data.invoice_url, status => {
          if (status === 'paid') onClose()
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="stack-sm center">
        <Sticker index={1} size={159} />
        <h2 className="text-h1 text-center">
          Возвратов нет(
        </h2>
        <p className="text-body text-center text-muted" style={{ width: 293, maxWidth: '100%' }}>
          Безлимитные возвраты доступны только Premium пользователям
        </p>
        <button onClick={onBuyPremium} className="btn-dark mt-xs">
          Получить возвраты с Premium
        </button>
        <span className="text-body text-muted">или купить их отдельно</span>
        <div className="stack-xs full-w mb-2xs">
          <ShopRow label="Купить 1 возврат" price={30} onClick={() => handleBuy(1)} />
          <ShopRow label="Купить 5 возвратов" price={150} onClick={() => handleBuy(5)} />
          <ShopRow label="Купить 10 возвратов" price={300} onClick={() => handleBuy(10)} />
        </div>
        <button onClick={onClose} className="btn-ghost text-body text-muted">
          Закрыть
        </button>
      </div>
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
