import { useState, useCallback, useEffect } from 'react'
import Sticker from './components/Sticker.jsx'
import { Screen } from './components/ui'
import useAuth from './hooks/useAuth.js'
import api from './api.js'
import Splash from './screens/Splash.jsx'
import OnboardingName from './screens/OnboardingName.jsx'
import OnboardingAge from './screens/OnboardingAge.jsx'
import OnboardingGender from './screens/OnboardingGender.jsx'
import OnboardingPhotos from './screens/OnboardingPhotos.jsx'
import OnboardingGeo from './screens/OnboardingGeo.jsx'
import OnboardingVerification from './screens/OnboardingVerification.jsx'
import OnboardingMemeIntro from './screens/OnboardingMemeIntro.jsx'
import MemeTestScreen from './screens/MemeTestScreen.jsx'
import SwipeScreen from './screens/SwipeScreen.jsx'
import LikesScreen from './screens/LikesScreen.jsx'
import MatchesScreen from './screens/MatchesScreen.jsx'
import AchievementsScreen from './screens/AchievementsScreen.jsx'
import ProfileScreen from './screens/ProfileScreen.jsx'
import PremiumScreen from './screens/PremiumScreen.jsx'
import BannedScreen from './screens/BannedScreen.jsx'
import UserProfileScreen from './screens/UserProfileScreen.jsx'
import DailyLoginModal from './modals/DailyLoginModal.jsx'
import InviteOnlyScreen from './screens/InviteOnlyScreen.jsx'
import BottomNav from './components/BottomNav.jsx'

const ONBOARDING_STEPS = ['name', 'gender', 'age', 'photos', 'geo', 'verification']

export default function App() {
  const { user, setUser, loading } = useAuth()
  const [splashDone, setSplashDone] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [profileData, setProfileData] = useState({})
  const [tab, setTab] = useState('search')
  const [profileResetSignal, setProfileResetSignal] = useState(0)
  const [screen, setScreen] = useState('app') // app | premium
  const [viewingUserId, setViewingUserId] = useState(null)
  const [viewingUserPreview, setViewingUserPreview] = useState(null)
  const [profileSwipeRequest, setProfileSwipeRequest] = useState(null)
  const [showDailyLogin, setShowDailyLogin] = useState(false)
  const [memeStep, setMemeStep] = useState(null) // null | 'intro' | 'test' — мем-тест после регистрации

  // Проверяем ежедневную награду после загрузки профиля
  useEffect(() => {
    if (user?.profile) {
      api.getDailyLogin().then(data => {
        if (data.has_reward) setShowDailyLogin(true)
      }).catch(() => {})
    }
  }, [user?.profile?.id])

  const needsOnboarding = user && !user.profile
  const needsInvite = user && user.invite_only_required

  const handleOnboardingNext = useCallback(async (data) => {
    const merged = { ...profileData, ...data }
    setProfileData(merged)

    const nextStep = onboardingStep + 1
    if (nextStep < ONBOARDING_STEPS.length) {
      setOnboardingStep(nextStep)
      return
    }

    try {
      // Извлекаем реф-код из Telegram startapp param или URL fallback
      const refCode = window.Telegram?.WebApp?.initDataUnsafe?.start_param
        || new URLSearchParams(window.location.search).get('startapp')
        || null

      await api.createProfile({
        name: merged.name,
        age: merged.age,
        birth_day: merged.birth_day,
        birth_month: merged.birth_month,
        birth_year: merged.birth_year,
        gender: merged.gender,
        lat: merged.geo?.lat,
        lng: merged.geo?.lng,
        referred_by_code: refCode,
      })

      if (merged.photoFiles?.length > 0) {
        for (let i = 0; i < merged.photoFiles.length; i++) {
          await api.uploadPhoto(merged.photoFiles[i], i)
        }
      }

      const meData = await api.me()
      setUser(meData.user)

      // После регистрации — пропускаемый промо-экран мем-теста (один раз)
      if (!localStorage.getItem('meme_intro_seen')) {
        setMemeStep('intro')
      }
    } catch (e) {
      console.error('Ошибка создания профиля:', e)
    }
  }, [onboardingStep, profileData, setUser])

  const handleOpenProfile = useCallback((userOrLike) => {
    // Принимаем объект с полем id или user_id
    const id = userOrLike?.id || userOrLike?.user_id
    if (id) {
      setViewingUserPreview(userOrLike)
      setViewingUserId(id)
    }
  }, [])

  const handleSetTab = useCallback((nextTab) => {
    if (nextTab === 'profile' && tab === 'profile') {
      setProfileResetSignal(signal => signal + 1)
    }
    setTab(nextTab)
  }, [tab])

  if (!splashDone) return <Splash onDone={() => setSplashDone(true)} />

  if (loading) {
    return (
      <Screen centered scroll={false} style={{ background: 'linear-gradient(180deg, #1C0030 0%, #3D0040 100%)' }}>
        <Sticker index={0} size={100} />
      </Screen>
    )
  }

  // Получаем start_param из initDataUnsafe (Telegram) или из URL параметров (fallback)
  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('startapp')
  if (needsInvite) return <InviteOnlyScreen startCode={startParam} onSuccess={() => setUser({ ...user, invite_only_required: false })} />

  if (needsOnboarding) {
    const currentStep = ONBOARDING_STEPS[onboardingStep]
    return (
      <>
        {onboardingStep < 4 && (
          <div style={{ position: 'absolute', top: 52, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10 }}>
            {ONBOARDING_STEPS.slice(0, 4).map((_, i) => (
              <div key={i} style={{ width: i === onboardingStep ? 20 : 6, height: 6, borderRadius: 3, background: i <= onboardingStep ? '#fff' : 'rgba(255,255,255,0.25)', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
        {currentStep === 'name'         && <OnboardingName onNext={handleOnboardingNext} />}
        {currentStep === 'gender'       && <OnboardingGender onNext={handleOnboardingNext} />}
        {currentStep === 'age'          && <OnboardingAge onNext={handleOnboardingNext} />}
        {currentStep === 'photos'       && <OnboardingPhotos onNext={handleOnboardingNext} />}
        {currentStep === 'geo'          && <OnboardingGeo onNext={handleOnboardingNext} />}
        {currentStep === 'verification' && <OnboardingVerification onNext={handleOnboardingNext} />}
      </>
    )
  }

  if (user?.is_banned) return <BannedScreen />

  // Мем-тест сразу после регистрации (пропускаемый шаг)
  if (memeStep) {
    const finishMeme = () => { localStorage.setItem('meme_intro_seen', '1'); setMemeStep(null) }
    if (memeStep === 'intro') {
      return <OnboardingMemeIntro onStart={() => setMemeStep('test')} onSkip={finishMeme} />
    }
    return <MemeTestScreen onClose={finishMeme} onDone={finishMeme} />
  }

  if (screen === 'premium') return <PremiumScreen user={user} onBack={() => setScreen('app')} />

  const isPremium = user?.profile?.is_premium || user?.is_premium || false

  return (
    <div className="app-container">
      <div className="app-content">
        {tab === 'search' && (
          <SwipeScreen
            currentUser={user}
            isPremium={isPremium}
            userGender={user?.profile?.gender}
            onOpenProfile={handleOpenProfile}
            onBuyPremium={() => setScreen('premium')}
            externalSwipeRequest={profileSwipeRequest}
          />
        )}
        {tab === 'likes' && (
          <LikesScreen
            onBuyPremium={() => setScreen('premium')}
            onOpenProfile={handleOpenProfile}
            onGoSearch={() => setTab('search')}
          />
        )}
        {tab === 'matches' && <MatchesScreen onOpenProfile={handleOpenProfile} />}
        {tab === 'achievements' && <AchievementsScreen />}
        {tab === 'profile' && (
          <ProfileScreen
            user={user}
            resetSignal={profileResetSignal}
            onBuyPremium={() => setScreen('premium')}
            onUpdate={setUser}
            onShowProfile={profile => {
              setViewingUserPreview({
                ...profile,
                is_own: true,
                photos: (profile?.photos || []).map(photo => photo?.url || photo),
              })
              setViewingUserId(profile?.id || user?.profile?.id || user?.id)
            }}
          />
        )}
      </div>
      <BottomNav tab={tab} setTab={handleSetTab} />

      {/* Просмотр профиля другого пользователя */}
      {viewingUserId && (
        <UserProfileScreen
          userId={viewingUserId}
          preview={viewingUserPreview}
          currentUser={user}
          onBack={() => {
            setViewingUserId(null)
            setViewingUserPreview(null)
          }}
          onSwipe={async (type, userId, message) => {
            setProfileSwipeRequest({
              type,
              userId,
              message,
              nonce: Date.now(),
            })
          }}
        />
      )}

      {/* Ежедневная награда */}
      {showDailyLogin && (
        <DailyLoginModal onClose={() => setShowDailyLogin(false)} />
      )}
    </div>
  )
}
