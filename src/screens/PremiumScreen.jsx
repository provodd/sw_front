import { useState } from 'react'
import Sticker from '../components/Sticker.jsx'
import api from '../api.js'
import { Screen, GlassCard, CircleIconButton } from '../components/ui'

const PLANS = [
  { key: '1mo',  label: '1 Месяц',   stars: 1,    months: 1  },
  { key: '3mo',  label: '3 Месяца',  stars: 990,  months: 3,  popular: true },
  { key: '1yr',  label: '1 Год',     stars: 4000, months: 12 },
]

const FEATURES = [
  { icon: '♥',  title: 'Просмотр лайков',     desc: 'Узнай, кому ты нравишься!' },
  { icon: '↩',  title: 'Вернуться назад',      desc: 'Отмени дизлайк или лайк, никаких ошибок' },
  { icon: '😍', title: 'Суперлайки',            desc: 'Выделись и сразу отправь сообщение' },
  { icon: '⚙️', title: 'Расширенные фильтры',  desc: 'Если знаешь, чего хочешь' },
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
  const [selected, setSelected] = useState('3mo')
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const profile = user?.profile
  const premiumUntil = profile?.premium_until
  const isPremiumActive = profile?.is_premium && premiumUntil && new Date(premiumUntil) > new Date()

  const selectedPlan = PLANS.find(p => p.key === selected)
  const newExpiry = selectedPlan ? calcNewExpiry(isPremiumActive ? premiumUntil : null, selectedPlan.months) : null

  const handleBuyClick = () => {
    if (isPremiumActive) {
      setShowConfirm(true)
    } else {
      doPurchase()
    }
  }

  const doPurchase = async () => {
    setShowConfirm(false)
    setLoading(true)
    try {
      const tg = window.Telegram?.WebApp
      const result = await api.createInvoice(selected)

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
    <Screen variant="gradient" style={{ paddingBottom: 40 }}>
      <CircleIconButton
        size={40}
        onClick={onBack}
        ariaLabel="Назад"
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          background: 'var(--surface-elev-3)',
          backdropFilter: 'none', WebkitBackdropFilter: 'none',
        }}
      >
        <span className="emoji-sm">←</span>
      </CircleIconButton>

      <div className="stack-lg center" style={{ padding: '70px 20px 0' }}>
        <Sticker index={0} size={110} />
        <h1 className="text-h1 text-wide text-center">СВАЙПИК PREMIUM</h1>

        {isPremiumActive ? (
          <div className="text-center full-w" style={{
            background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)',
            borderRadius: 16, padding: '12px 20px',
          }}>
            <p className="text-small text-muted mb-2xs">Premium активен до</p>
            <p className="text-body font-bold" style={{ color: 'var(--success)' }}>{formatDate(premiumUntil)}</p>
          </div>
        ) : (
          <p className="text-small text-muted text-center" style={{ maxWidth: 280 }}>
            С Premium подпиской ты найдёшь партнёра в два раза быстрее!
          </p>
        )}

        {/* Plan cards */}
        <div className="stack-sm full-w">
          {PLANS.map(plan => {
            const expiry = calcNewExpiry(isPremiumActive ? premiumUntil : null, plan.months)
            const active = selected === plan.key
            return (
              <GlassCard
                key={plan.key}
                onClick={() => setSelected(plan.key)}
                className="row-between pointer"
                style={{
                  padding: '16px 20px',
                  background: active
                    ? 'linear-gradient(135deg, rgba(233,30,140,0.3), rgba(255,77,179,0.15))'
                    : undefined,
                  border: active ? '1.5px solid rgba(233,30,140,0.7)' : undefined,
                }}
              >
                <div className="text-left">
                  <div className="row" style={{ gap: 8 }}>
                    <span className="text-h3">{plan.label}</span>
                    {plan.popular && (
                      <span className="text-caption font-semi" style={{
                        background: 'var(--accent)',
                        padding: '2px 8px', borderRadius: 20,
                      }}>Выгодно</span>
                    )}
                  </div>
                  {isPremiumActive && (
                    <div className="text-faint text-caption" style={{ marginTop: 3 }}>
                      до {formatDate(expiry)}
                    </div>
                  )}
                </div>
                <span className="text-h3">{plan.stars} ⭐</span>
              </GlassCard>
            )
          })}
        </div>

        {/* Features */}
        <GlassCard className="stack-md full-w" style={{ padding: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
              <div className="center shrink-0 emoji-sm" style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--accent-soft)',
              }}>
                {f.icon}
              </div>
              <div>
                <p className="text-body font-bold">{f.title}</p>
                <p className="text-small text-faint" style={{ marginTop: 2 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </GlassCard>

        <button
          className="btn-pink mt-2xs"
          onClick={handleBuyClick}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Обработка...' : isPremiumActive ? 'Продлить Premium ⭐' : 'Оформить подписку ⭐'}
        </button>

        <p className="text-caption text-dim text-center" style={{ paddingBottom: 10 }}>
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

            <button className="btn-pink" onClick={doPurchase} disabled={loading}>
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
