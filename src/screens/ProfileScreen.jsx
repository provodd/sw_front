import { useState, useEffect } from 'react'
import api from '../api.js'
import AboutSwipePointsModal from '../modals/AboutSwipePointsModal.jsx'
import ExchangeSwipePointsModal from '../modals/ExchangeSwipePointsModal.jsx'
import MemeTestScreen from './MemeTestScreen.jsx'
import { Screen, ScreenHeader, LoadingState, VerifiedBadge } from '../components/ui'

// ЗАГЛУШКИ: на бэкенде нет штучных счётчиков возвратов и бустеров —
// числа временные, чисто для соответствия макету. Реальные данные подключить позже.
const RETURNS_PLACEHOLDER  = 0
const BOOSTERS_PLACEHOLDER = 1

const CARD_ICON = { width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }

export default function ProfileScreen({ user, onBuyPremium, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAboutPoints, setShowAboutPoints] = useState(false)
  const [showExchange, setShowExchange] = useState(false)
  const [boosterLoading, setBoosterLoading] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [hiddenSaving, setHiddenSaving] = useState(false)
  const [showMemeTest, setShowMemeTest] = useState(false)

  useEffect(() => {
    api.getProfile().then(data => {
      setProfile(data.profile)
      setHidden(!!data.profile?.is_hidden)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const reloadProfile = async () => {
    const data = await api.getProfile()
    setProfile(data.profile)
    setHidden(!!data.profile?.is_hidden)
  }

  if (loading) return <LoadingState />

  if (editing) {
    return <EditProfile profile={profile} onBack={async () => { await reloadProfile(); setEditing(false) }} />
  }

  const boosterActive = profile?.booster_active
  const boosterUntil = profile?.booster_until ? new Date(profile.booster_until) : null

  const handleBooster = async () => {
    setBoosterLoading(true)
    try {
      const result = await api.activateBooster()
      alert(result.message)
      await reloadProfile()
    } catch (e) {
      alert(e.message)
    } finally {
      setBoosterLoading(false)
    }
  }

  // Переключатель «Показать/Скрыть» — реальный, пишет profile.is_hidden
  const toggleHidden = async () => {
    const next = !hidden
    setHidden(next)
    setHiddenSaving(true)
    try {
      await api.updateProfile({ is_hidden: next })
    } catch (e) {
      setHidden(!next)
      alert(e.message)
    } finally {
      setHiddenSaving(false)
    }
  }

  return (
    <Screen withNav>
      <ScreenHeader title="ПРОФИЛЬ" className="mb-lg" />

      <div className="px-gutter stack-xs">
        {/* ── Шапка профиля ── */}
        <div className="card-dark" style={{ borderRadius: 'var(--radius-lg)', padding: 16 }}>
          <div className="row" style={{ alignItems: 'stretch', gap: 'clamp(16px, 5vw, 32px)' }}>
            <div className="overflow-hidden shrink-0 center" style={{
              width: 90, height: 128, borderRadius: 'var(--radius-md)', background: 'var(--surface-photo)',
            }}>
              {profile?.photos?.[0]
                ? <img src={profile.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="emoji-lg text-faint">👤</span>}
            </div>

            <div className="flex-1" style={{
              minWidth: 0, alignSelf: 'stretch', paddingBlock: 4,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div>
                <div className="row mb-2xs" style={{ gap: 8 }}>
                  <span className="text-display" style={{ whiteSpace: 'nowrap' }}>
                    {profile?.name}, {profile?.age}
                  </span>
                  {profile?.verified && <VerifiedBadge size={25} />}
                </div>
                <p className="text-body text-faint">{profile?.city || 'Не указан'}</p>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn-dark btn-dark--sm" onClick={() => setEditing(true)}>Изменить</button>
                <button className="btn-dark btn-dark--sm" onClick={toggleHidden} disabled={hiddenSaving}>
                  {hidden ? 'Показать' : 'Скрыть'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Суперлайки / Возвраты ── */}
        <div className="row" style={{ gap: 8 }}>
          <StatCard icon="/icons/card-superlike.svg" value={profile?.superlike_daily ?? 0} label="Суперлайков" />
          {/* заглушка: счётчик возвратов на бэкенде не хранится */}
          <StatCard icon="/icons/card-undo.svg" value={RETURNS_PLACEHOLDER} label="Возврата" />
        </div>

        {/* ── Бустер ── */}
        <div className="card-dark" style={{ borderRadius: 'var(--radius-card)', padding: 16 }}>
          <div className="row-between" style={{ alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0, maxWidth: 160 }}>
              <p className="text-h2 mb-xs">Бустер</p>
              <p className="text-small text-muted leading-snug">
                {boosterActive
                  ? `Активен до ${boosterUntil?.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Твой профиль будет чаще показываться в поиске в течении 30 минут'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
              <div className="row" style={{ gap: 14, alignItems: 'center' }}>
                <img src="/icons/card-booster.svg" alt="" style={CARD_ICON} />
                <div className="center" style={{ flexDirection: 'column', gap: 2 }}>
                  {/* заглушка: штучного счётчика бустеров на бэкенде нет */}
                  <span className="text-display">{BOOSTERS_PLACEHOLDER}</span>
                  <span className="text-small text-muted">Бустер</span>
                </div>
              </div>
              <button
                className="btn-dark btn-dark--sm"
                onClick={handleBooster}
                disabled={boosterActive || boosterLoading}
                style={{ opacity: boosterLoading ? 0.7 : 1 }}
              >
                {boosterActive ? 'Буст активен' : boosterLoading ? 'Активация…' : 'Активировать'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Свайп-очки ── */}
        <div className="card-dark" style={{
          borderRadius: 'var(--radius-card)', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 4vh, 44px)',
        }}>
          <div className="row-between" style={{ alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-h2 mb-xs">Свайп-очки</p>
              <p className="text-small text-muted leading-snug">
                Зарабатывай свайп-очки и обменивай их на улучшения
              </p>
            </div>
            <button className="btn-dark btn-dark--sm" style={{ background: 'var(--accent-deep)' }} onClick={() => setShowAboutPoints(true)}>
              Что это?
            </button>
          </div>
          <div className="row-between" style={{ alignItems: 'flex-end' }}>
            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <span className="text-display">{profile?.swipe_coins ?? 0}</span>
              <img src="/icons/coin.png" alt="" style={CARD_ICON} />
            </div>
            <button className="btn-dark btn-dark--sm" onClick={() => setShowExchange(true)}>Обменять</button>
          </div>
        </div>

        {/* ── Мем-тест ── */}
        <div className="card-dark" style={{
          borderRadius: 'var(--radius-card)', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2.5vh, 24px)',
        }}>
          <div className="row-between" style={{ alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-h2 mb-xs">Мем-тест</p>
              <p className="text-small text-muted leading-snug">
                Посчитаем совместимость на основе ваших любимых мемов
              </p>
            </div>
            <div className="center shrink-0" style={{ flexDirection: 'column', gap: 2 }}>
              <span className="text-display">{profile?.meme_stats?.rated ?? 0}/{profile?.meme_stats?.total ?? 0}</span>
              <span className="text-small text-muted">Оценено</span>
            </div>
          </div>
          <button className="btn-dark btn-dark--sm mx-auto" style={{ display: 'block' }} onClick={() => setShowMemeTest(true)}>
            {(profile?.meme_stats?.rated ?? 0) > 0 ? 'Продолжить' : 'Стартуем!'}
          </button>
        </div>

        {/* Поддержка — ЗАГЛУШКА: чат/ссылка поддержки пока не подключены */}
        <button className="btn-ghost text-small text-muted mx-auto" style={{ display: 'block' }} onClick={() => {}}>
          Поддержка
        </button>
      </div>

      {showAboutPoints && <AboutSwipePointsModal onClose={() => setShowAboutPoints(false)} />}
      {showExchange && (
        <ExchangeSwipePointsModal
          coins={profile?.swipe_coins || 0}
          onClose={() => setShowExchange(false)}
          onExchange={reloadProfile}
        />
      )}
      {showMemeTest && (
        <MemeTestScreen onClose={async () => { setShowMemeTest(false); await reloadProfile() }} />
      )}
    </Screen>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <div className="card-dark center flex-1" style={{ borderRadius: 'var(--radius-md)', minHeight: 84, padding: 12 }}>
      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
        <img src={icon} alt="" style={CARD_ICON} />
        <div className="center" style={{ flexDirection: 'column', gap: 2 }}>
          <span className="text-display">{value}</span>
          <span className="text-small text-muted">{label}</span>
        </div>
      </div>
    </div>
  )
}

function EditProfile({ profile, onBack }) {
  const [bio, setBio] = useState(profile?.bio || '')
  const [hidden, setHidden] = useState(profile?.is_hidden || false)
  const [saving, setSaving] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState(null)
  const [photos, setPhotos] = useState(profile?.photos || [])

  const save = async () => {
    setSaving(true)
    try {
      await api.updateProfile({ bio, is_hidden: hidden })
      onBack()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const uploadPhoto = async (e, order) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingIdx(order)
    try {
      const result = await api.uploadPhoto(file, order)
      setPhotos(prev => {
        const next = [...prev]
        next[order] = result.photo
        return next
      })
    } catch (e) {
      alert(e.message)
    } finally {
      setUploadingIdx(null)
    }
  }

  const deletePhoto = async (photoId, order) => {
    try {
      await api.deletePhoto(photoId)
      setPhotos(prev => prev.filter((_, i) => i !== order))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <Screen style={{ padding: '20px var(--gutter) 16px' }}>
      <div className="row mb-lg" style={{ gap: 12 }}>
        <button onClick={onBack} className="btn-ghost emoji-sm" style={{ padding: 0 }}>←</button>
        <h2 className="text-h2 font-extra">ИЗМЕНИТЬ</h2>
      </div>

      <p className="text-small mb-sm text-faint">Фото профиля</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
        {[0, 1, 2, 3].map(i => {
          const photo = photos[i]
          return (
            <div key={i} style={{ position: 'relative', aspectRatio: '3/4' }}>
              <label className="full center overflow-hidden pointer" style={{
                borderRadius: 16,
                background: photo ? 'transparent' : 'rgba(233,30,140,0.12)',
                border: photo ? 'none' : '2px dashed rgba(233,30,140,0.4)',
              }}>
                {photo ? (
                  <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : uploadingIdx === i ? (
                  <span className="emoji-md">⏳</span>
                ) : (
                  <span className="emoji-md" style={{ color: 'rgba(233,30,140,0.6)' }}>+</span>
                )}
                {!photo && <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadPhoto(e, i)} />}
              </label>
              {photo && (
                <button
                  onClick={() => deletePhoto(photo.id, i)}
                  className="center text-small"
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 26, height: 26, color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }}
                >✕</button>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-caption text-dim text-center mb-lg">Перетащите, чтобы изменить порядок</p>

      <p className="text-small mb-xs text-faint">Описание</p>
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value)}
        rows={3}
        className="text-small"
        style={{
          width: '100%', padding: '12px 14px',
          background: 'var(--surface-elev-1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 14, color: 'var(--text)',
          resize: 'none', outline: 'none', marginBottom: 20, fontFamily: 'inherit',
        }}
      />

      {profile?.verified && (
        <div className="row mb-sm" style={{
          background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: 14, padding: '14px 16px', gap: 10,
        }}>
          <span className="emoji-sm">✅</span>
          <span className="font-semi">Профиль верифицирован</span>
        </div>
      )}

      <div className="row-between mb-lg" style={{
        background: 'var(--surface-elev-1)', borderRadius: 14, padding: '14px 16px',
      }}>
        <div className="row" style={{ gap: 12 }}>
          <span className="emoji-sm">🔒</span>
          <div>
            <p className="text-small font-semi">Скрыть профиль</p>
            <p className="text-caption text-faint" style={{ marginTop: 2 }}>Скрывает твой профиль из поиска</p>
          </div>
        </div>
        <div onClick={() => setHidden(!hidden)} className="pointer" style={{
          width: 48, height: 28, borderRadius: 14,
          background: hidden ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
          position: 'relative', transition: 'background var(--transition-fast)',
        }}>
          <div style={{ position: 'absolute', top: 4, left: hidden ? 24 : 4, width: 20, height: 20, borderRadius: '50%', background: 'var(--text)', transition: 'left var(--transition-fast)' }} />
        </div>
      </div>

      <button className="btn-pink" onClick={save} disabled={saving}>
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </Screen>
  )
}
