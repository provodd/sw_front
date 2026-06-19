import BottomSheet from '../components/BottomSheet.jsx'

export default function AboutSwipePointsModal({ onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <div className="stack-md center" style={{ gap: 'clamp(12px, 4vw, 20px)', padding: '0 clamp(4px, 2vw, 12px) 8px' }}>
        {/* Coin icon */}
        <div className="center shrink-0 emoji-xl" style={{
          width: 'clamp(120px, 35vw, 153px)', height: 'clamp(120px, 35vw, 153px)',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 35% 25%, #f040a0 0%, #a01060 45%, #600830 100%)',
          boxShadow: '0 4px 24px rgba(233,30,140,0.4)',
        }}>
          🪙
        </div>

        <h2 className="text-h1 text-center">
          Свайп-очки
        </h2>

        <div className="stack-md text-body text-muted leading-loose" style={{ textAlign: 'justify' }}>
          <p>Заходя в приложение каждый день, ты получаешь свайп-очки. С 1 по 7 день их количество растёт, пока не достигнет +7, далее +7 за каждый день.</p>
          <p>Набрав достаточное количество свайп-очков, их можно обменять на премиум аккаунт.</p>
          <p>За каждый свайп, без разницы, лайк это или дизлайк, также начисляются свайп-очки — по 0.5 за свайп.</p>
        </div>

        <button onClick={onClose} className="btn-dark mt-2xs">
          Понятно!
        </button>
      </div>
    </BottomSheet>
  )
}
