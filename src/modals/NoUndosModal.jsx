import api from '../api.js'
import Sticker from '../components/Sticker.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import StarIcon from '../components/icons/StarIcon.jsx'

function getReturnWord(count) {
  const abs = Math.abs(Number(count))
  const lastTwo = abs % 100
  const last = abs % 10

  if (lastTwo >= 11 && lastTwo <= 14) return 'возвратов'
  if (last === 1) return 'возврат'
  if (last >= 2 && last <= 4) return 'возврата'
  return 'возвратов'
}

export default function NoUndosModal({ onClose, onBuyPremium, returnBalance = 0 }) {
  const balance = Number(returnBalance) || 0
  const title = balance > 0 ? `${balance} ${getReturnWord(balance)}` : 'Возвратов нет('

  const handleBuy = async (count, closeSheet) => {
    try {
      const data = await api.purchaseUndos(count)
      if (data.invoice_url) {
        window.Telegram?.WebApp?.openInvoice?.(data.invoice_url, status => {
          if (status === 'paid') closeSheet()
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <BottomSheet onClose={onClose} className="no-undos-sheet">
      {closeSheet => (
      <div className="no-undos-sheet__content center">
        <Sticker index={1} size={159} />
        <h2 className="no-undos-sheet__title text-h1 text-center">
          {title}
        </h2>
        <p className="no-undos-sheet__description text-body text-center text-muted">
          Безлимитные возвраты доступны только Premium пользователям
        </p>
        <button onClick={onBuyPremium} className="no-undos-sheet__premium btn-dark">
          Получить возвраты с Premium
        </button>
        <span className="no-undos-sheet__separator text-body text-muted">или купить их отдельно</span>
        <div className="no-undos-sheet__plans full-w">
          <UndoShopRow label="Купить 1 возврат" price={20} onClick={() => handleBuy(1, closeSheet)} />
          <UndoShopRow label="Купить 5 возвратов" price={30} onClick={() => handleBuy(5, closeSheet)} />
          <UndoShopRow label="Купить 10 возвратов" price={50} onClick={() => handleBuy(10, closeSheet)} />
        </div>
        <button onClick={closeSheet} className="no-undos-sheet__close btn-ghost text-body">
          Закрыть
        </button>
      </div>
      )}
    </BottomSheet>
  )
}

function UndoShopRow({ label, price, onClick }) {
  return (
    <button type="button" onClick={onClick} className="no-undos-sheet__plan row-between full-w">
      <span>{label}</span>
      <span className="no-undos-sheet__price">
        {price}
        <PlanStar />
      </span>
    </button>
  )
}

function PlanStar() {
  return <StarIcon className="no-undos-sheet__star" />
}
