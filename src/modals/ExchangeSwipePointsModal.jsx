import { useState, useEffect } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'
import api from '../api.js'

const TYPE_ICON = {
  superlike: '😍',
  booster: '🚀',
}

export default function ExchangeSwipePointsModal({ onClose, coins = 0, onExchange }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getExchangePlans().then(data => setPlans(data.plans)).catch(console.error)
  }, [])

  const handleExchange = async (planKey) => {
    setLoading(planKey)
    try {
      const result = await api.exchange(planKey)
      onExchange?.(result)
      onClose()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      <h2 className="text-h1 text-center mb-lg">
        Обменять свайп-очки
      </h2>

      <div className="text-center mb-lg">
        <p className="text-small text-faint mb-xs">Заработано:</p>
        <div className="row center" style={{ gap: 8 }}>
          <span className="text-jumbo font-extra">{coins}</span>
          <span className="emoji-md">🪙</span>
        </div>
      </div>

      <p className="text-small text-muted mb-sm">Обменять на:</p>
      <div className="stack-sm mb-lg">
        {plans.map(plan => {
          const disabled = coins < plan.coins || loading === plan.key
          return (
            <button
              key={plan.key}
              onClick={() => handleExchange(plan.key)}
              disabled={disabled}
              className="row-between text-body"
              style={{
                padding: '14px 20px', borderRadius: 44, background: 'var(--surface-base)',
                border: 'none', color: 'var(--text)',
                cursor: disabled ? 'default' : 'pointer',
                fontFamily: 'inherit', opacity: coins < plan.coins ? 0.4 : 1,
              }}
            >
              <span>{plan.coins.toLocaleString()} 🪙</span>
              <span className="row" style={{ gap: 6 }}>
                <span className="font-bold">→ {plan.reward}</span>
                <span>{TYPE_ICON[plan.type] || '🎁'}</span>
              </span>
            </button>
          )
        })}
      </div>

      <button onClick={onClose} className="btn-ghost text-faint full-w">
        Закрыть
      </button>
    </BottomSheet>
  )
}
