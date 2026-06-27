import { useState, useEffect } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'
import api from '../api.js'

const FIGMA_EXCHANGE_PLANS = [
  { key: 'boost_1', coins: 500, reward: 'Бустер', type: 'booster' },
  { key: 'undo_10', coins: 700, reward: '10 возвратов', type: 'undo' },
  { key: 'sl_10', coins: 1000, reward: '10 суперлайков', type: 'superlike' },
  { key: 'premium_1mo', coins: 5000, reward: 'Premium-аккаунт (1мес)', type: 'premium' },
]

function formatCoins(value) {
  return Number(value || 0).toLocaleString('ru-RU')
}

function CoinIcon({ className = '' }) {
  return <img className={`exchange-swipe-points__coin ${className}`} src="/icons/coin.png" alt="" draggable={false} />
}

export default function ExchangeSwipePointsModal({ onClose, coins = 0, onExchange }) {
  const [plans, setPlans] = useState([])
  const [selectedPlanKey, setSelectedPlanKey] = useState(FIGMA_EXCHANGE_PLANS[0].key)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getExchangePlans().then(data => setPlans(data.plans)).catch(console.error)
  }, [])

  const handleExchange = async (planKey, closeSheet) => {
    setLoading(planKey)
    try {
      const result = await api.exchange(planKey)
      onExchange?.(result)
      closeSheet()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const mergedPlans = FIGMA_EXCHANGE_PLANS.map(figmaPlan => {
    const apiPlan = plans.find(plan => plan.key === figmaPlan.key)
    return apiPlan ? { ...figmaPlan, ...apiPlan } : figmaPlan
  })
  const selectedPlan = mergedPlans.find(plan => plan.key === selectedPlanKey) || mergedPlans[0]

  return (
    <BottomSheet onClose={onClose}>
      {closeSheet => (
      <div className="exchange-swipe-points">
      <h2 className="exchange-swipe-points__title text-h1 text-center">
        Обменять свайп-очки
      </h2>

      <div className="exchange-swipe-points__balance text-center">
        <p className="exchange-swipe-points__label text-small text-faint">Заработано:</p>
        <div className="exchange-swipe-points__balance-value row center">
          <span className="text-jumbo font-extra">{coins}</span>
          <CoinIcon className="exchange-swipe-points__coin--balance" />
        </div>
      </div>

      <p className="exchange-swipe-points__label text-small text-muted">Обменять на:</p>
      <div className="exchange-swipe-points__plans stack-sm">
        {mergedPlans.map(plan => {
          return (
            <button
              key={plan.key}
              type="button"
              onClick={() => setSelectedPlanKey(plan.key)}
              className="exchange-swipe-points__plan row-between text-body"
              data-unavailable={coins < plan.coins ? 'true' : undefined}
              data-active={selectedPlanKey === plan.key ? 'true' : undefined}
            >
              <span className="exchange-swipe-points__reward">
                {plan.reward}
              </span>
              <span className="exchange-swipe-points__cost row">
                <span>{formatCoins(plan.coins)}</span>
                <CoinIcon />
              </span>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => selectedPlan && handleExchange(selectedPlan.key, closeSheet)}
        disabled={!selectedPlan || loading === selectedPlan.key}
        className="exchange-swipe-points__submit btn-dark"
      >
        {loading === selectedPlan?.key ? 'Обмен...' : 'Обменять'}
      </button>

      <button onClick={closeSheet} className="exchange-swipe-points__close btn-ghost text-faint full-w">
        Закрыть
      </button>
      </div>
      )}
    </BottomSheet>
  )
}
