import BottomSheet from '../components/BottomSheet.jsx'
import api from '../api.js'
import StarIcon from '../components/icons/StarIcon.jsx'

const BOOSTER_PLANS = [
  { count: 1, label: '1 бустер', price: 380 },
  { count: 3, label: '3 бустера', price: 600 },
  { count: 5, label: '5 бустеров', price: 890 },
]

export default function BuyBoostersModal({ onClose, onPurchased }) {
  const handleBuy = async (count, closeSheet) => {
    try {
      const data = typeof api.purchaseBoosters === 'function'
        ? await api.purchaseBoosters(count)
        : await api.createInvoice?.({ type: 'booster', count })

      const invoiceUrl = data?.invoice_url || data?.invoice_link
      if (invoiceUrl) {
        window.Telegram?.WebApp?.openInvoice?.(invoiceUrl, status => {
          if (status === 'paid') {
            onPurchased?.()
            closeSheet()
          }
        })
        return
      }

      onPurchased?.()
      closeSheet()
    } catch (error) {
      alert(error.message || 'Не удалось открыть оплату')
    }
  }

  return (
    <BottomSheet onClose={onClose} className="buy-boosters-sheet">
      {closeSheet => (
        <div className="buy-boosters-sheet__content center">
          <div className="buy-boosters-sheet__emoji" aria-hidden="true">🚀</div>

          <h2 className="buy-boosters-sheet__title text-h1 text-center">
            Бустер
          </h2>

          <p className="buy-boosters-sheet__description text-small text-center">
            С помощью бустера твой профиль будет чаще показываться в поиске в течении 30 минут
          </p>

          <div className="buy-boosters-sheet__shop full-w">
            <p className="buy-boosters-sheet__label text-caption text-muted">Купить:</p>
            <div className="buy-boosters-sheet__plans">
              {BOOSTER_PLANS.map(plan => (
                <button
                  key={plan.count}
                  type="button"
                  className="buy-boosters-sheet__plan row-between"
                  onClick={() => handleBuy(plan.count, closeSheet)}
                >
                  <span>{plan.label}</span>
                  <span className="buy-boosters-sheet__price">
                    {plan.price}
                    <PlanStar />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={closeSheet} className="buy-boosters-sheet__close btn-ghost text-body">
            Закрыть
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

function PlanStar() {
  return <StarIcon className="buy-boosters-sheet__star" />
}
