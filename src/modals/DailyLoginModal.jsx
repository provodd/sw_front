import { useState, useEffect } from 'react'
import api from '../api.js'
import { Screen } from '../components/ui'

export default function DailyLoginModal({ onClose }) {
  const [data, setData] = useState(null)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    api.getDailyLogin().then(setData).catch(console.error)
  }, [])

  const handleClaim = async () => {
    setClaiming(true)
    try {
      const result = await api.claimDailyLogin()
      setData(result)
      setClaimed(true)
    } catch (e) {
      console.error(e)
      onClose()
    } finally {
      setClaiming(false)
    }
  }

  if (!data) return null

  const streak = claimed ? data.streak : (data.streak + (data.has_reward ? 1 : 0))
  const coins = data.coins_reward

  return (
    <Screen centered scroll={false} style={{
      zIndex: 500,
      padding: 'clamp(28px, 6vh, 72px) 32px',
      background: 'var(--bg-app)',
    }}>
      {/* Единая центрированная группа с адаптивными vh-промежутками */}
      <div className="full-w center text-center" style={{
        flexDirection: 'column', gap: 'clamp(28px, calc(14vh - 52px), 110px)',
      }}>
        {/* Стрик */}
        <div>
          <div className="mb-xs">
            <span className="text-h2 text-muted font-semi">Ежедневный вход</span>
          </div>
          <div className="text-giant" style={{
            fontSize: 'clamp(64px, calc(16vh - 20px), 140px)',
            background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {streak}
          </div>
          <div className="text-h1 font-bold text-muted">
            {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}
          </div>
        </div>

        {/* Награда */}
        {!claimed && data.has_reward && (
          <div>
            <p className="mb-md text-body text-muted">Твоя награда:</p>
            <div className="row center" style={{ gap: 12 }}>
              <span className="text-hero" style={{
                background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>+{coins}</span>
              <img src="/icons/coin.png" alt="" width={48} height={48} style={{ display: 'block' }} />
            </div>
          </div>
        )}

        {claimed && (
          <div>
            <div className="center mx-auto mb-sm" style={{
              width: 'clamp(56px, 16vw, 72px)',
              height: 'clamp(56px, 16vw, 72px)',
              borderRadius: '50%',
              background: '#8b0f4b82',
            }}>
              <svg width="52%" height="52%" viewBox="0 0 24 24" fill="none"
                stroke="var(--text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-h3 font-regular text-muted">+{coins} монет начислено!</p>
          </div>
        )}

        {/* Кнопка + подпись (вместе, сразу под блоком награды) */}
        <div className="full-w center" style={{ flexDirection: 'column', gap: 'clamp(10px, 2vh, 16px)' }}>
          {!claimed && data.has_reward ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="btn-dark"
              style={{ opacity: claiming ? 0.7 : 1 }}
            >
              {claiming ? 'Получение...' : 'Получить'}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn-dark"
            >
              Продолжить
            </button>
          )}

          <p className="text-small text-muted text-center">
            Заходи каждый день,<br />чтобы награда оставалась высокой!
          </p>
        </div>
      </div>
    </Screen>
  )
}
