import { useState } from 'react'
import Sticker from '../components/Sticker.jsx'
import api from '../api.js'
import StarIcon from '../components/icons/StarIcon.jsx'
import { Screen, CircleIconButton } from '../components/ui'

const PLANS = [
  { key: '1mo', label: '1 Месяц',  stars: 500,  months: 1 },
  { key: '3mo', label: '3 Месяца', stars: 1000, months: 3 },
  { key: '1yr', label: '1 Год',    stars: 2500, months: 12 },
]

const FEATURES = [
  { icon: 'superlike', title: '5 суперлайков в день', desc: 'Выделись и сразу отправь сообщение' },
  { icon: 'undo',      title: 'Безлимитные возвраты', desc: 'Отмени дизлайк или лайк, никаких ошибок' },
  { icon: 'filters',   title: 'Расширенные фильтры',  desc: 'Если точно знаешь, чего хочешь' },
  { icon: 'age',       title: 'Изменить возраст',     desc: 'Меняй свой возраст когда захочешь' },
  { icon: 'privacy',   title: 'Приватность',          desc: 'Скрой свой возраст или расстояние до тебя' },
  { icon: 'no-ads',    title: 'Отсутствие рекламы',   desc: 'Когда ценишь свое время' },
]

function formatDate(date) {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function calcNewExpiry(currentUntil, months) {
  const base = currentUntil && new Date(currentUntil) > new Date()
    ? new Date(currentUntil)
    : new Date()
  const result = new Date(base)
  result.setMonth(result.getMonth() + months)
  return result
}

export default function PremiumScreen({ user, onBack }) {
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const profile = user?.profile
  const premiumUntil = profile?.premium_until
  const isPremiumActive = profile?.is_premium && premiumUntil && new Date(premiumUntil) > new Date()

  const selectedPlan = PLANS.find(p => p.key === selected)
  const newExpiry = selectedPlan ? calcNewExpiry(isPremiumActive ? premiumUntil : null, selectedPlan.months) : null

  const handlePlanClick = (planKey) => {
    setSelected(planKey)
    if (isPremiumActive) {
      setShowConfirm(true)
    } else {
      doPurchase(planKey)
    }
  }

  const doPurchase = async (planKey = selected) => {
    setShowConfirm(false)
    setLoading(true)
    try {
      const tg = window.Telegram?.WebApp
      const result = await api.createInvoice(planKey)

      if (result.invoice_link && tg?.openInvoice) {
        tg.openInvoice(result.invoice_link, (status) => {
          if (status === 'paid') {
            alert('Premium активирован! 🎉')
            onBack()
          } else if (status === 'failed' || status === 'cancelled') {
            alert('Оплата не прошла')
          }
        })
      } else {
        alert('Premium активирован! 🎉')
        onBack()
      }
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen className="premium-screen">
      <CircleIconButton
        size="clamp(44px, 12.21vw, 48px)"
        onClick={onBack}
        ariaLabel="Назад"
        className="premium-screen__back"
      >
        <svg viewBox="0 0 32 24" fill="none" aria-hidden="true">
          <path d="M12 4 4 12l8 8M5 12h23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </CircleIconButton>

      <div className="premium-screen__content center">
        <div className="premium-screen__mascot">
          <Sticker index={0} size={130} />
        </div>
        <h1 className="premium-screen__title text-center">СВАЙПИК PREMIUM</h1>

        {isPremiumActive ? (
          <div className="premium-screen__active text-center full-w">
            <p className="text-small text-muted mb-2xs">Premium активен до</p>
            <p className="text-body font-bold" style={{ color: 'var(--success)' }}>{formatDate(premiumUntil)}</p>
          </div>
        ) : (
          <p className="premium-screen__subtitle text-body text-center">
            С Premium подпиской ты найдёшь партнёра в два раза быстрее!
          </p>
        )}

        <div className="premium-plans full-w">
          {PLANS.map(plan => {
            const expiry = calcNewExpiry(isPremiumActive ? premiumUntil : null, plan.months)
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => handlePlanClick(plan.key)}
                disabled={loading}
                className="premium-plan row-between"
              >
                <div className="text-left">
                  <div className="row premium-plan__label">
                    <span>{plan.label}</span>
                  </div>
                  {isPremiumActive && (
                    <div className="text-faint text-caption" style={{ marginTop: 3 }}>
                      до {formatDate(expiry)}
                    </div>
                  )}
                </div>
                <span className="premium-plan__price">
                  {plan.stars}
                  <PlanStar />
                </span>
              </button>
            )
          })}
        </div>

        <div className="premium-features card-dark full-w">
          {FEATURES.map((f, i) => (
            <div key={i} className="premium-feature row">
              <div className="premium-feature__icon center shrink-0">
                <PremiumFeatureIcon type={f.icon} />
              </div>
              <div className="premium-feature__copy">
                <p className="premium-feature__title">{f.title}</p>
                <p className="premium-feature__description">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="premium-screen__notice text-caption text-center">
          Оплата через Telegram Stars. Отмена в любое время.
        </p>
      </div>

      {/* Confirmation modal */}
      {showConfirm && newExpiry && (
        <div className="row" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          alignItems: 'flex-end', zIndex: 200,
        }}>
          <div className="stack-md full-w" style={{
            background: '#1a0028', borderRadius: '24px 24px 0 0',
            padding: '28px 24px 40px',
          }}>
            <h3 className="text-h2 text-center">Продление Premium</h3>

            <div className="stack-sm" style={{
              background: 'var(--surface-elev-1)', borderRadius: 16,
              padding: '16px 20px',
            }}>
              <div className="row-between text-small">
                <span className="text-muted">Текущий срок</span>
                <span className="font-semi">{formatDate(premiumUntil)}</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div className="row-between text-small">
                <span className="text-muted">Тариф</span>
                <span className="font-semi">{selectedPlan?.label} ({selectedPlan?.stars} ⭐)</span>
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div className="row-between text-small">
                <span className="text-muted">Новый срок</span>
                <span className="font-bold" style={{ color: 'var(--success)' }}>{formatDate(newExpiry)}</span>
              </div>
            </div>

            <p className="text-small text-center text-muted">
              Оплата прибавит {selectedPlan?.months} {selectedPlan?.months === 1 ? 'месяц' : selectedPlan?.months < 5 ? 'месяца' : 'месяцев'} к текущей подписке
            </p>

            <button className="btn-pink" onClick={() => doPurchase(selected)} disabled={loading}>
              {loading ? 'Обработка...' : 'Продолжить ⭐'}
            </button>
            <button onClick={() => setShowConfirm(false)} className="btn-ghost text-body text-muted">
              Отмена
            </button>
          </div>
        </div>
      )}
    </Screen>
  )
}

function PlanStar() {
  return <StarIcon className="premium-plan__star" />
}

function PremiumFeatureIcon({ type }) {
  if (type === 'superlike') {
    return <img src="/icons/superlike.svg" alt="" aria-hidden="true" />
  }
  if (type === 'undo') {
    return <img src="/icons/undo.svg" alt="" aria-hidden="true" />
  }
  if (type === 'filters') {
    return <img src="/icons/filters.svg" alt="" aria-hidden="true" />
  }
  if (type === 'age') {
    return (
      <svg viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path d="M21.075 5.015H9.015C7.307 5.015 6 3.708 6 2h18.09c0 1.708-1.307 3.015-3.015 3.015ZM9.015 25.113h12.06c1.708 0 3.015 1.307 3.015 3.015H6c0-1.708 1.307-3.015 3.015-3.015Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22.079 25.115v-4.02c0-.603-.302-1.206-.804-1.608l-3.719-2.814a1.995 1.995 0 0 1 0-3.216l3.719-2.814c.502-.402.804-1.005.804-1.608v-4.02M8.008 5.016v4.02c0 .602.302 1.205.804 1.607l3.719 2.814a1.995 1.995 0 0 1 0 3.216l-3.719 2.814c-.502.402-.804 1.005-.804 1.608v4.02M10.018 25.115l5.025-5.025 5.025 5.025h-10.05ZM15.045 11.045 12.03 9.035h6.03l-3.015 2.01Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (type === 'privacy') {
    return (
      <svg viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path d="M12.184 22.967a4.194 4.194 0 1 1-8.387 0 4.194 4.194 0 0 1 8.387 0ZM26.163 22.967a4.194 4.194 0 1 1-8.388 0 4.194 4.194 0 0 1 8.388 0Z" stroke="currentColor" strokeWidth="2" />
        <path d="M1.001 14.581h27.957M18.474 20.649a4.19 4.19 0 0 0-6.989 0M2.399 14.581l2.323-8.803c.136-.513.203-.768.268-.952.952-2.65 4.068-3.663 6.317-2.054.154.11.353.279.748.62.227.196.34.294.445.373a4.19 4.19 0 0 0 4.959 0c.105-.08.218-.177.446-.373.394-.34.593-.51.747-.62 2.25-1.61 5.365-.596 6.318 2.054.064.182.133.44.267.951l2.323 8.804H2.399Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  return <img src="/icons/no-ads.svg" alt="" aria-hidden="true" />
}
