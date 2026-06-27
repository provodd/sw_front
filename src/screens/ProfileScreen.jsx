import { useState, useEffect } from 'react'
import api from '../api.js'
import AboutSwipePointsModal from '../modals/AboutSwipePointsModal.jsx'
import ExchangeSwipePointsModal from '../modals/ExchangeSwipePointsModal.jsx'
import NoUndosModal from '../modals/NoUndosModal.jsx'
import BuyBoostersModal from '../modals/BuyBoostersModal.jsx'
import BuySuperlikesModal from '../modals/BuySuperlikesModal.jsx'
import EditProfileDetailModal from '../modals/EditProfileDetailModal.jsx'
import InterestsModal from '../modals/InterestsModal.jsx'
import MemeTestScreen from './MemeTestScreen.jsx'
import OnboardingAge from './OnboardingAge.jsx'
import { Screen, ScreenHeader, LoadingState, VerifiedBadge, PremiumBadge } from '../components/ui'

// ЗАГЛУШКИ: на бэкенде нет штучных счётчиков возвратов и бустеров —
// числа временные, чисто для соответствия макету. Реальные данные подключить позже.
const RETURNS_PLACEHOLDER  = 0
const BOOSTERS_PLACEHOLDER = 0

const CARD_ICON = { width: 34, height: 34, objectFit: 'contain', flexShrink: 0 }

export default function ProfileScreen({ user, resetSignal = 0, onBuyPremium, onUpdate, onShowProfile }) {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAboutPoints, setShowAboutPoints] = useState(false)
  const [showExchange, setShowExchange] = useState(false)
  const [boosterLoading, setBoosterLoading] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [hiddenSaving, setHiddenSaving] = useState(false)
  const [showMemeTest, setShowMemeTest] = useState(false)
  const [showNoUndos, setShowNoUndos] = useState(false)
  const [showBuyBoosters, setShowBuyBoosters] = useState(false)
  const [showBuySuperlikes, setShowBuySuperlikes] = useState(false)

  useEffect(() => {
    api.getProfile().then(data => {
      setProfile(data.profile)
      setHidden(!!data.profile?.is_hidden)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!resetSignal) return
    setEditing(false)
    setShowAboutPoints(false)
    setShowExchange(false)
    setShowMemeTest(false)
    setShowNoUndos(false)
    setShowBuyBoosters(false)
    setShowBuySuperlikes(false)
  }, [resetSignal])

  const reloadProfile = async () => {
    const data = await api.getProfile()
    setProfile(data.profile)
    setHidden(!!data.profile?.is_hidden)
  }

  if (loading) return <LoadingState />

  if (editing) {
    return (
      <EditProfile
        profile={profile}
        onProfileSaved={(nextProfile) => {
          setProfile(nextProfile)
          setHidden(!!nextProfile?.is_hidden)
          onUpdate?.(prev => ({
            ...prev,
            profile: nextProfile,
            is_premium: nextProfile?.is_premium ?? prev?.is_premium,
          }))
        }}
      />
    )
  }

  const boosterActive = profile?.booster_active
  const boosterUntil = profile?.booster_until ? new Date(profile.booster_until) : null
  const isPremium = Boolean(profile?.is_premium || user?.is_premium)
  const returnsBalance = Number(
    profile?.returns_count
    ?? profile?.return_count
    ?? profile?.undo_count
    ?? profile?.undos
    ?? RETURNS_PLACEHOLDER
  ) || 0
  const boostersBalance = Number(
    profile?.boosters_count
    ?? profile?.booster_count
    ?? profile?.boosters
    ?? BOOSTERS_PLACEHOLDER
  ) || 0

  const handleBooster = async () => {
    if (!boosterActive && boostersBalance <= 0) {
      setShowBuyBoosters(true)
      return
    }

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

  const showOwnProfile = async () => {
    setHiddenSaving(true)
    try {
      const data = await api.getProfile()
      setProfile(data.profile)
      onShowProfile?.(data.profile)
    } catch (e) {
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
                  {profile?.is_premium && <PremiumBadge size={25} />}
                </div>
                <p className="text-body text-faint">{profile?.city || 'Не указан'}</p>
              </div>
              <div className="profile-header-actions row">
                <button className="btn-dark btn-dark--sm" onClick={() => setEditing(true)}>Изменить</button>
                <button className="btn-dark btn-dark--sm" onClick={showOwnProfile} disabled={hiddenSaving}>
                  Показать
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Суперлайки / Возвраты ── */}
        <div className="profile-stats-row row">
          <StatCard
            icon="/icons/card-superlike.svg"
            value={profile?.superlike_daily ?? 0}
            label="Суперлайков"
            onClick={() => setShowBuySuperlikes(true)}
          />
          {/* заглушка: счётчик возвратов на бэкенде не хранится */}
          <StatCard
            icon="/icons/card-undo.svg"
            value={isPremium ? '∞' : returnsBalance}
            label="Возврата"
            onClick={!isPremium ? () => setShowNoUndos(true) : undefined}
          />
        </div>

        {/* ── Бустер ── */}
        <div className="profile-booster-card card-dark">
          <div className="profile-booster-card__copy">
            <p className="profile-booster-card__title">Бустер</p>
            <p className="profile-booster-card__text">
              {boosterActive
                ? `Активен до ${boosterUntil?.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`
                : 'Твой профиль будет чаще показываться в поиске в течении 30 минут'}
            </p>
          </div>
          <div className="profile-booster-card__meta">
            <div className="profile-booster-card__counter row">
              <span className="profile-icon-tile glass-light" aria-hidden="true">
                <img className="profile-booster-card__icon" src="/icons/card-booster.svg" alt="" />
              </span>
              <div className="profile-booster-card__value-wrap center">
                {/* заглушка: штучного счётчика бустеров на бэкенде нет */}
                <span className="profile-stat__value">{boostersBalance}</span>
                <span className="profile-stat__label">Бустер</span>
              </div>
            </div>
            <button
              className="profile-booster-card__button btn-dark btn-dark--sm"
              onClick={handleBooster}
              disabled={boosterActive || boosterLoading}
              style={{ opacity: boosterLoading ? 0.7 : 1 }}
            >
              {boosterActive ? 'Буст активен' : boosterLoading ? 'Активация…' : boostersBalance <= 0 ? 'Получить' : 'Активировать'}
            </button>
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
          <button className="profile-meme-test-button btn-dark mx-auto" onClick={() => setShowMemeTest(true)}>
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
      {showNoUndos && (
        <NoUndosModal
          returnBalance={returnsBalance}
          onClose={() => setShowNoUndos(false)}
          onBuyPremium={() => { setShowNoUndos(false); onBuyPremium?.() }}
        />
      )}
      {showBuyBoosters && (
        <BuyBoostersModal
          onClose={() => setShowBuyBoosters(false)}
          onPurchased={reloadProfile}
        />
      )}
      {showBuySuperlikes && (
        <BuySuperlikesModal
          onClose={() => setShowBuySuperlikes(false)}
          onPurchased={reloadProfile}
        />
      )}
    </Screen>
  )
}

function StatCard({ icon, value, label, onClick }) {
  const isInteractive = Boolean(onClick)
  const Component = isInteractive ? 'button' : 'div'

  return (
    <Component
      className={`profile-stat card-dark${isInteractive ? ' profile-stat--interactive' : ''}`}
      {...(isInteractive ? { type: 'button', onClick } : {})}
    >
      <div className="profile-stat__inner row">
        <span className="profile-icon-tile glass-light" aria-hidden="true">
          <img className="profile-stat__icon" src={icon} alt="" />
        </span>
        <div className="profile-stat__copy center">
          <span className="profile-stat__value">{value}</span>
          <span className="profile-stat__label">{label}</span>
        </div>
      </div>
    </Component>
  )
}

function EditProfile({ profile, onProfileSaved }) {
  const [age, setAge] = useState(profile?.age || 25)
  const [birthDate, setBirthDate] = useState({
    day: profile?.birth_day,
    month: profile?.birth_month,
    year: profile?.birth_year,
  })
  const [bio, setBio] = useState(profile?.bio || '')
  const [savedBio, setSavedBio] = useState(profile?.bio || '')
  const [interests, setInterests] = useState(profile?.interests || [])
  const [hidden, setHidden] = useState(profile?.is_hidden || false)
  const [hideDistance, setHideDistance] = useState(profile?.hide_distance || false)
  const [hideAge, setHideAge] = useState(profile?.hide_age || false)
  const [uploadingIdx, setUploadingIdx] = useState(null)
  const [photos, setPhotos] = useState(profile?.photos || [])
  const [showInterests, setShowInterests] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showAgeEditor, setShowAgeEditor] = useState(false)

  const saveBio = async () => {
    if (bio === savedBio) return
    try {
      await api.updateProfile({ bio })
      setSavedBio(bio)
    } catch (e) {
      alert(e.message)
    }
  }

  const saveInterests = async (nextInterests) => {
    setInterests(nextInterests)
    try {
      await api.updateProfile({ interests: nextInterests })
    } catch (e) {
      alert(e.message)
    }
  }

  const toggleProfileSetting = async (key, current, setValue) => {
    const next = !current
    setValue(next)
    try {
      await api.updateProfile({ [key]: next })
    } catch (e) {
      setValue(current)
      alert(e.message)
    }
  }

  const saveAge = async ({ age: nextAge, birth_day, birth_month, birth_year }) => {
    try {
      const result = await api.updateProfile({ age: nextAge, birth_day, birth_month, birth_year })
      const savedProfile = result?.profile || {
        ...profile,
        age: nextAge,
        birth_day,
        birth_month,
        birth_year,
      }
      setAge(savedProfile.age ?? nextAge)
      setBirthDate({
        day: savedProfile.birth_day ?? birth_day,
        month: savedProfile.birth_month ?? birth_month,
        year: savedProfile.birth_year ?? birth_year,
      })
      onProfileSaved?.(savedProfile)
      setShowAgeEditor(false)
    } catch (e) {
      alert(e.message)
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

  if (showAgeEditor) {
    return (
      <OnboardingAge
        className="profile-age-screen"
        initialAge={age}
        initialBirthDay={birthDate.day}
        initialBirthMonth={birthDate.month}
        initialBirthYear={birthDate.year}
        submitLabel="Сохранить"
        onNext={saveAge}
      />
    )
  }

  return (
    <Screen withNav className="edit-profile-screen">
      <div className="edit-profile-header">
        <h2>ИЗМЕНИТЬ</h2>
      </div>

      <div className="edit-profile-content">
        <section className="edit-profile-section">
          <p className="edit-profile-label">Фото профиля</p>
          <div className="edit-profile-photos card-dark">
            <div className="edit-profile-photo-grid">
              {[0, 1, 2, 3].map(i => {
                const photo = photos[i]
                return (
                  <div key={i} className="edit-profile-photo-slot">
                    <label className={`edit-profile-photo-button pointer ${photo ? 'has-photo' : 'glass-light'}`}>
                      {photo ? (
                        <img src={photo.url} alt="" />
                      ) : uploadingIdx === i ? (
                        <span className="edit-profile-photo-loading">⏳</span>
                      ) : (
                        <AddPhotoIcon />
                      )}
                      {!photo && <input type="file" accept="image/*" onChange={e => uploadPhoto(e, i)} />}
                    </label>
                    {photo && (
                      <button
                        onClick={() => deletePhoto(photo.id, i)}
                        className="edit-profile-photo-delete"
                        aria-label="Удалить фотографию"
                      >✕</button>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="edit-profile-photo-hint">Перетащите, чтобы изменить порядок</p>
          </div>
        </section>

        <section className="edit-profile-section">
          <p className="edit-profile-label">Описание</p>
          <div className="edit-profile-bio card-dark">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              onBlur={saveBio}
              maxLength={500}
              aria-label="Описание профиля"
            />
            <span>{bio.length}/500</span>
          </div>
        </section>

        {profile?.verified && (
          <section className="edit-profile-section">
            <p className="edit-profile-label">Верификация</p>
            <div className="edit-profile-verification card-dark">
              <VerifiedBadge size={37} />
              <span>Профиль верифицирован</span>
            </div>
          </section>
        )}

        <section className="edit-profile-section">
          <p className="edit-profile-label">Параметры</p>
          <div className="edit-profile-options">
            <EditProfileOption
              icon={<InterestsIcon />}
              title="Добавьте свои интересы"
              description="Расскажи, что тебе нравится"
              onClick={() => setShowInterests(true)}
            />
            <EditProfileOption
              icon={<ProfileDetailsIcon />}
              title="Основное"
              description="Позволь узнать тебя чуть больше!"
              onClick={() => setShowDetails(true)}
            />
            <div className="edit-profile-option card-dark">
              <div className="edit-profile-option__icon"><LockIcon /></div>
              <div className="edit-profile-option__copy">
                <strong>Скрыть профиль</strong>
                <span>Скрывает твой профиль из поиска</span>
              </div>
              <ToggleSwitch
                checked={hidden}
                onChange={() => toggleProfileSetting('is_hidden', hidden, setHidden)}
                label="Скрыть профиль"
              />
            </div>
          </div>
        </section>

        {profile?.is_premium && (
          <section className="edit-profile-section">
            <p className="edit-profile-label">Premium</p>
            <div className="edit-profile-options">
              <div className="edit-profile-option card-dark">
                <div className="edit-profile-option__icon"><DistanceIcon /></div>
                <div className="edit-profile-option__copy">
                  <strong>Скрыть расстояние</strong>
                  <span>Никто не узнает, как ты далеко</span>
                </div>
                <ToggleSwitch
                  checked={hideDistance}
                  onChange={() => toggleProfileSetting('hide_distance', hideDistance, setHideDistance)}
                  label="Скрыть расстояние"
                />
              </div>
              <div className="edit-profile-option card-dark">
                <div className="edit-profile-option__icon"><AgeIcon /></div>
                <div className="edit-profile-option__copy">
                  <strong>Скрыть возраст</strong>
                  <span>Эйджизм — отстой</span>
                </div>
                <ToggleSwitch
                  checked={hideAge}
                  onChange={() => toggleProfileSetting('hide_age', hideAge, setHideAge)}
                  label="Скрыть возраст"
                />
              </div>
              <button
                type="button"
                className="edit-profile-age-button"
                onClick={() => setShowAgeEditor(true)}
              >
                Изменить возраст
              </button>
            </div>
          </section>
        )}
      </div>

      {showInterests && (
        <InterestsModal
          current={interests}
          onClose={() => setShowInterests(false)}
          onSave={saveInterests}
        />
      )}
      {showDetails && (
        <EditProfileDetailModal
          profile={profile}
          onClose={() => setShowDetails(false)}
        />
      )}
    </Screen>
  )
}

function EditProfileOption({ icon, title, description, onClick }) {
  return (
    <button className="edit-profile-option card-dark" onClick={onClick}>
      <span className="edit-profile-option__icon">{icon}</span>
      <span className="edit-profile-option__copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <ChevronIcon />
    </button>
  )
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`edit-profile-toggle ${checked ? 'is-on' : ''}`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  )
}

function AddPhotoIcon() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 7v18M7 16h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
}

function InterestsIcon() {
  return <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M6.347 2.502c.177-.014.525.032 1.304.405.773.37 1.759.953 3.187 1.801l11.884 7.054c1.289.765 2.169 1.288 2.788 1.735.468.338.676.557.773.694l.066.112c.201.446.201.947 0 1.394-.052.116-.214.355-.839.806-.619.447-1.499.971-2.788 1.736l-11.884 7.053c-1.428.848-2.414 1.431-3.187 1.801-.779.373-1.126.419-1.303.405h-.001c-.606-.046-1.137-.337-1.472-.766-.077-.098-.216-.359-.295-1.174-.078-.808-.08-1.901-.08-3.504V7.946c0-1.603.002-2.696.08-3.504.079-.815.218-1.076.295-1.174.335-.429.867-.72 1.472-.766Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /></svg>
}

function ProfileDetailsIcon() {
  return <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M27.614 5.717a1.452 1.452 0 1 1 0 2.903H13.46a1.452 1.452 0 1 1 0-2.903h14.154ZM17.638 21c.752 0 1.362.672 1.362 1.5s-.61 1.5-1.362 1.5H4.362C3.61 24 3 23.328 3 22.5S3.61 21 4.362 21h13.276Z" fill="currentColor" /><path fillRule="evenodd" d="M22.896 19.63a3.266 3.266 0 1 0 0 6.532 3.266 3.266 0 0 0 0-6.532Zm0 9.435a6.17 6.17 0 1 0 0-12.338 6.17 6.17 0 0 0 0 12.338ZM7.17 3.903a3.266 3.266 0 1 0 0 6.532 3.266 3.266 0 0 0 0-6.532Zm0 9.436A6.17 6.17 0 1 0 7.17 1a6.17 6.17 0 0 0 0 12.339Z" fill="currentColor" /></svg>
}

function LockIcon() {
  return <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M12.184 22.967a4.194 4.194 0 1 1-8.387 0 4.194 4.194 0 0 1 8.387 0ZM26.163 22.967a4.194 4.194 0 1 1-8.388 0 4.194 4.194 0 0 1 8.388 0Z" stroke="currentColor" strokeWidth="2" /><path d="M1.001 14.581h27.957M18.474 20.649a4.19 4.19 0 0 0-6.989 0M2.399 14.581l2.323-8.803c.136-.513.203-.768.268-.952.952-2.65 4.068-3.663 6.317-2.054.154.11.353.279.748.62.227.196.34.294.445.373a4.19 4.19 0 0 0 4.959 0c.105-.08.218-.177.446-.373.394-.34.593-.51.747-.62 2.25-1.61 5.365-.596 6.318 2.054.064.182.133.44.267.951l2.323 8.804H2.399Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
}

function DistanceIcon() {
  return <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M15.033 3c5.97 0 11.033 4.944 11.033 10.942 0 6.092-5.145 10.369-9.896 13.275a2.32 2.32 0 0 1-2.273 0C9.153 24.284 4.001 20.057 4.001 13.943 4.001 7.944 9.064 3 15.033 3Z" stroke="currentColor" strokeWidth="2" /><path d="M11.375 9.603c1.315-.784 2.462-.468 3.151.034.282.208.424.31.508.31.083 0 .224-.102.507-.31.689-.502 1.836-.818 3.152-.034 1.726 1.03 2.115 4.424-1.864 7.287-.76.546-1.137.82-1.795.82-.659 0-1.037-.274-1.795-.82-3.98-2.863-3.59-6.259-1.864-7.287Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
}

function AgeIcon() {
  return <svg viewBox="0 0 30 30" fill="none" aria-hidden="true"><path d="M21.075 5.015H9.015C7.307 5.015 6 3.708 6 2h18.09c0 1.708-1.307 3.015-3.015 3.015ZM9.015 25.113h12.06c1.708 0 3.015 1.307 3.015 3.015H6c0-1.708 1.307-3.015 3.015-3.015Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22.079 25.115v-4.02c0-.603-.302-1.206-.804-1.608l-3.719-2.814a1.995 1.995 0 0 1 0-3.216l3.719-2.814c.502-.402.804-1.005.804-1.608v-4.02M8.008 5.016v4.02c0 .602.302 1.205.804 1.607l3.719 2.814a1.995 1.995 0 0 1 0 3.216l-3.719 2.814c-.502.402-.804 1.005-.804 1.608v4.02M10.018 25.115l5.025-5.025 5.025 5.025h-10.05ZM15.045 11.045 12.03 9.035h6.03l-3.015 2.01Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function ChevronIcon() {
  return <svg className="edit-profile-chevron" viewBox="0 0 12 24" fill="none" aria-hidden="true"><path d="m2 2 8 10-8 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
