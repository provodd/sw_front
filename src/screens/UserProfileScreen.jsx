import { useState, useEffect } from 'react'
import api from '../api.js'
import BottomSheet from '../components/BottomSheet.jsx'
import TelegramIcon from '../components/icons/TelegramIcon.jsx'
import StarIcon from '../components/icons/StarIcon.jsx'
import SuperLikeModal from '../modals/SuperLikeModal.jsx'
import { CompatibilitySheet } from './SwipeScreen.jsx'
import { Screen, CircleIconButton, LoadingState, VerifiedBadge, PremiumBadge, FadeOverlay, Chip } from '../components/ui'
import {
  getAchievementMeta,
  readVisibleAchievementKeys,
} from '../data/achievements.js'

const hapticError = () => {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error')
  } catch { /* browser noop */ }
}

export default function UserProfileScreen({ userId, preview, currentUser, onBack, onSwipe }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [revealPrice, setRevealPrice] = useState(1000)
  const [revealed, setRevealed] = useState(null)
  const [revealing, setRevealing] = useState(false)
  const [showSuperLikeSheet, setShowSuperLikeSheet] = useState(false)
  const [showCompatibilitySheet, setShowCompatibilitySheet] = useState(false)
  const [showReportSheet, setShowReportSheet] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [visibleAchievementKeys, setVisibleAchievementKeys] = useState(() => readVisibleAchievementKeys())

  useEffect(() => {
    if (!userId) return
    Promise.all([
      api.getUserProfile(userId),
      api.getRevealPrice(userId),
    ]).then(([profileData, priceData]) => {
      setUser({ ...profileData.user, ...preview })
      setRevealPrice(priceData.price ?? 1)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [userId, preview])

  useEffect(() => {
    if (!user?.achievements?.length) return
    setVisibleAchievementKeys(readVisibleAchievementKeys(user.achievements.map(item => item.key)))
  }, [user?.achievements])

  useEffect(() => {
    const syncAchievementVisibility = () => {
      setVisibleAchievementKeys(readVisibleAchievementKeys(user?.achievements?.map(item => item.key) || []))
    }

    window.addEventListener('swipik:achievement-visibility-changed', syncAchievementVisibility)
    window.addEventListener('storage', syncAchievementVisibility)
    return () => {
      window.removeEventListener('swipik:achievement-visibility-changed', syncAchievementVisibility)
      window.removeEventListener('storage', syncAchievementVisibility)
    }
  }, [user?.achievements])

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

  const handleSwipe = async (type, closeSheet, message) => {
    setSwiping(true)
    try {
      await onSwipe?.(type, userId, message)
      closeSheet()
    } catch (e) {
      console.error(e)
    } finally {
      setSwiping(false)
    }
  }

  if (loading) {
    return (
      <Screen className="user-profile-screen" style={{ zIndex: 300 }}>
        <LoadingState />
      </Screen>
    )
  }

  if (!user) return null

  const photos = user.photos || []
  const isOwnProfile = !!(user.is_own || user.is_self)
  const isMatchedProfile = !!(user.is_match || user.match_id)
  const isLikesProfile = !!(user.from_likes || user.is_liker)
  const profileAchievements = (user.achievements || [])
    .map(item => {
      const meta = getAchievementMeta(item.key)
      return {
        ...item,
        ...meta,
        title: meta?.title || item.title,
        image: meta?.image || item.image,
        tone: meta?.tone || item.tone,
      }
    })
    .filter(item => visibleAchievementKeys.has(item.key))
  const showPreviousPhoto = () => {
    if (photos.length <= 1) {
      hapticError()
      return
    }
    setPhotoIdx(i => Math.max(i - 1, 0))
  }
  const showNextPhoto = () => {
    if (photos.length <= 1) {
      hapticError()
      return
    }
    setPhotoIdx(i => Math.min(i + 1, photos.length - 1))
  }

  return (
    <BottomSheet onClose={onBack} className="user-profile-sheet glass-dark">
      {closeSheet => (
      <div className={`user-profile-sheet__layout ${isOwnProfile ? 'is-own' : ''}`}>
      <div className="user-profile-scroll">
      <div className={`stack-md center user-profile-content ${isOwnProfile ? 'is-own' : ''}`}>

        {/* Photo frame */}
        <div className={`user-profile-photo relative overflow-hidden shrink-0 full-w ${isOwnProfile ? 'is-own' : ''} ${isMatchedProfile ? 'is-match' : ''}`}>

          <img
            src={photos[photoIdx] || `https://picsum.photos/seed/${user.id}/400/600`}
            alt=""
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          <FadeOverlay position="top" height="45%" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)' }} />
          <FadeOverlay position="bottom" height="28%" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />

          {(user.city || user.distance) && (
            <div className="user-profile-location row">
              {user.city && (
                <span className="text-small text-muted truncate">{user.city}</span>
              )}
              {user.distance && (
                <div className="swipe-distance row glass-light text-caption shrink-0">
                  <svg width="8" height="10" viewBox="0 0 10 13" fill="none" aria-hidden="true">
                    <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5C4.17 6.5 3.5 5.83 3.5 5S4.17 3.5 5 3.5 6.5 4.17 6.5 5 5.83 6.5 5 6.5z" fill="currentColor"/>
                  </svg>
                  {user.distance}
                </div>
              )}
            </div>
          )}

          <div className="user-profile-name row">
            <span className="text-h1" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
              {user.name}, {user.age}
            </span>
            {user.verified && <VerifiedBadge size={25} />}
            {user.is_premium && <PremiumBadge size={25} />}
          </div>

          {/* Photo tap zones */}
          <button
            type="button"
            className="user-profile-photo-zone user-profile-photo-zone--left"
            onClick={showPreviousPhoto}
            aria-label="Предыдущее фото"
          />
          <button
            type="button"
            className="user-profile-photo-zone user-profile-photo-zone--right"
            onClick={showNextPhoto}
            aria-label="Следующее фото"
          />

          {/* Photo dots */}
          {photos.length > 1 && (
            <div className="user-profile-photo-dots row">
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
          {!isOwnProfile && !isMatchedProfile && (
            <div className="user-profile-actions row">
              <CircleIconButton className="glass-light" onClick={() => handleSwipe('dislike', closeSheet)} ariaLabel="dislike" style={{ opacity: swiping ? 0.6 : 1 }}>
                <img src="/icons/dislike.svg" width={28} height={28} alt="dislike" draggable={false} style={{ objectFit: 'contain' }} />
              </CircleIconButton>
              <CircleIconButton className="glass-light" onClick={() => setShowSuperLikeSheet(true)} ariaLabel="superlike" style={{ opacity: swiping ? 0.6 : 1 }}>
                <img src="/icons/superlike.svg" width={28} height={28} alt="superlike" draggable={false} style={{ objectFit: 'contain' }} />
              </CircleIconButton>
              <CircleIconButton className="glass-light" onClick={() => handleSwipe('like', closeSheet)} ariaLabel="like" style={{ opacity: swiping ? 0.6 : 1 }}>
                <img src="/icons/like.svg" width={28} height={28} alt="like" draggable={false} style={{ objectFit: 'contain' }} />
              </CircleIconButton>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="stack-lg full-w" style={{ padding: '0 16px', boxSizing: 'border-box' }}>

          {!isOwnProfile && user.compatibility != null && (
            <button
              type="button"
              className="user-profile-compatibility glass-light center mx-auto"
              onClick={() => setShowCompatibilitySheet(true)}
            >
              <span className="text-body font-bold">Мем-совместимость {user.compatibility}%</span>
            </button>
          )}

          {user.bio && (
            <>
              <p className="text-tight text-faint text-body">О себе</p>
              <p className="user-profile-bio text-tight text-body">{user.bio}</p>
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

          {profileAchievements.length > 0 && (
            <>
              <p className="text-tight text-faint text-body">Ачивки</p>
              <div className="cluster-sm">
                {profileAchievements.map(a => (
                  <button
                    type="button"
                    key={a.key}
                    title={a.title}
                    className={`user-profile-achievement ${a.tone === 'accent' ? 'user-profile-achievement--accent' : ''}`}
                    onClick={() => setSelectedAchievement(a)}
                    aria-label={`Открыть ачивку ${a.title}`}
                  >
                    {a.image ? (
                      <img src={a.image} alt="" loading="lazy" />
                    ) : (
                      <span>{a.icon}</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {!isOwnProfile && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '4px 0' }} />
              <button
                type="button"
                className="user-profile-report center text-tight text-body"
                onClick={() => setShowReportSheet(true)}
              >
                Пожаловаться
              </button>
            </>
          )}

        </div>
      </div>
      </div>

      {!isOwnProfile && !isMatchedProfile && !isLikesProfile && user.username && (
        <div className="user-profile-telegram-dock">
          <button
            onClick={handleReveal}
            disabled={revealing}
            className="user-profile-telegram"
          >
            <TelegramIcon className="user-profile-telegram__send" />
            <span>
              <strong>Написать в Telegram</strong>
              {!revealed && <small>не дожидаясь мэтча</small>}
            </span>
            {!revealed && (
              <b className="user-profile-telegram__price">
                <StarIcon className="user-profile-telegram__star" color="#fff" />
                {revealPrice}
              </b>
            )}
          </button>
        </div>
      )}

      {showSuperLikeSheet && (
        <SuperLikeModal
          user={user}
          onClose={() => setShowSuperLikeSheet(false)}
          onSend={(target, message) => {
            setShowSuperLikeSheet(false)
            handleSwipe('super', closeSheet, message)
          }}
        />
      )}

      {showCompatibilitySheet && (
        <CompatibilitySheet
          currentUser={currentUser}
          viewedUser={user}
          onClose={() => setShowCompatibilitySheet(false)}
        />
      )}

      {selectedAchievement && (
        <ProfileAchievementSheet
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}

      {showReportSheet && (
        <ReportProfileSheet
          user={user}
          onClose={() => setShowReportSheet(false)}
        />
      )}
      </div>
      )}
    </BottomSheet>
  )
}

function ProfileAchievementSheet({ achievement, onClose }) {
  return (
    <BottomSheet onClose={onClose} className="achievement-detail-sheet">
      {closeSheet => (
        <div className="achievement-detail-sheet__content center">
          <div className={`achievement-detail-sheet__media ${achievement.tone === 'accent' ? 'achievement-detail-sheet__media--accent' : ''}`}>
            <img className="achievement-detail-sheet__image" src={achievement.image} alt="" />
          </div>

          <div className="achievement-detail-sheet__headline text-center">
            <h2 className="achievement-detail-sheet__title">{achievement.title}</h2>
            <p className="achievement-detail-sheet__subtitle">{achievement.subtitle || achievement.desc}</p>
          </div>

          <p className="achievement-detail-sheet__description text-center">
            {achievement.detailDesc || achievement.desc}
          </p>

          <button type="button" onClick={closeSheet} className="achievement-detail-sheet__close btn-ghost text-body">
            Закрыть
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

function ReportProfileSheet({ user, onClose }) {
  const [reason, setReason] = useState('')
  const maxLength = 250
  const avatar = user?.photos?.[0] || `https://picsum.photos/seed/${user?.id || 'report'}/240/240`

  const submitReport = (closeSheet) => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success')
    } catch { /* browser noop */ }
    closeSheet()
  }

  return (
    <BottomSheet onClose={onClose} className="report-profile-sheet">
      {closeSheet => (
        <form
          className="report-profile-sheet__content center"
          onSubmit={(event) => {
            event.preventDefault()
            submitReport(closeSheet)
          }}
        >
          <div className="report-profile-sheet__header center">
            <div className="report-profile-sheet__avatar-wrap">
              <img className="report-profile-sheet__avatar" src={avatar} alt="" />
              <span className="report-profile-sheet__badge" aria-hidden="true">!</span>
            </div>
            <h2 className="report-profile-sheet__title">Пожаловаться</h2>
            <p className="report-profile-sheet__subtitle">Мы во всем разберемся</p>
          </div>

          <label className="report-profile-sheet__field full-w">
            <span className="report-profile-sheet__field-head row-between">
              <span>Укажи причину жалобы:</span>
              <span>{reason.length}/{maxLength}</span>
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, maxLength))}
              maxLength={maxLength}
              className="report-profile-sheet__textarea"
              placeholder="Скам"
            />
          </label>

          <button type="submit" className="report-profile-sheet__submit btn-dark">
            Отправить жалобу
          </button>

          <button
            type="button"
            onClick={closeSheet}
            className="report-profile-sheet__close btn-ghost text-body"
          >
            Закрыть
          </button>
        </form>
      )}
    </BottomSheet>
  )
}
