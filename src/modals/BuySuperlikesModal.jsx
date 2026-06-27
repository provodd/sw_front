import BottomSheet from '../components/BottomSheet.jsx'
import api from '../api.js'
import StarIcon from '../components/icons/StarIcon.jsx'

const SUPERLIKE_PLANS = [
  { count: 1, label: '1 суперлайк', price: 40 },
  { count: 5, label: '5 суперлайков', price: 70 },
  { count: 10, label: '10 суперлайков', price: 100 },
]

export default function BuySuperlikesModal({ onClose, onPurchased }) {
  const handleBuy = async (count, closeSheet) => {
    try {
      const data = await api.purchaseSuperlikes(count)
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
    <BottomSheet onClose={onClose} className="buy-superlikes-sheet">
      {closeSheet => (
        <div className="buy-superlikes-sheet__content center">
          <div className="buy-superlikes-sheet__emoji" aria-hidden="true">😍</div>

          <h2 className="buy-superlikes-sheet__title text-h1 text-center">
            Пополнить суперлайки
          </h2>

          <p className="buy-superlikes-sheet__description text-body text-center text-muted">
            Выделяйся и сразу отправляй сообщение
          </p>

          <div className="buy-superlikes-sheet__plans full-w">
            {SUPERLIKE_PLANS.map(plan => (
              <button
                key={plan.count}
                type="button"
                className="buy-superlikes-sheet__plan row-between full-w"
                onClick={() => handleBuy(plan.count, closeSheet)}
              >
                <span>{plan.label}</span>
                <span className="buy-superlikes-sheet__price">
                  {plan.price}
                  <PlanStar />
                </span>
              </button>
            ))}
          </div>

          <button type="button" onClick={closeSheet} className="buy-superlikes-sheet__close btn-ghost text-body">
            Закрыть
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

function PlanStar() {
  return <StarIcon className="buy-superlikes-sheet__star" />
}
