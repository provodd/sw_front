import BottomSheet from '../components/BottomSheet.jsx'

export default function AboutSwipePointsModal({ onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      {closeSheet => (
      <div className="stack-md center" style={{ gap: 'clamp(12px, 4vw, 20px)', padding: '0 clamp(4px, 2vw, 12px) 8px' }}>
        <img
          className="about-swipe-points__icon shrink-0"
          src="/icons/coin.png"
          alt="Свайп-очки"
        />

        <h2 className="text-h1 text-center">
          Свайп-очки
        </h2>

        <div className="stack-md text-body text-muted leading-loose" style={{ textAlign: 'justify' }}>
          <p>Заходя в приложение каждый день, ты получаешь свайп-очки. С 1 по 7 день их количество растёт, пока не достигнет +7, далее +7 за каждый день.</p>
          <p>Набрав достаточное количество свайп-очков, их можно обменять на премиум аккаунт.</p>
          <p>За каждый свайп, без разницы, лайк это или дизлайк, также начисляются свайп-очки — по 0.5 за свайп.</p>
        </div>

        <button onClick={closeSheet} className="btn-dark mt-2xs">
          Понятно!
        </button>
      </div>
      )}
    </BottomSheet>
  )
}
