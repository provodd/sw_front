import { useState } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'

export default function SuperLikeModal({ user, onClose, onSend }) {
  const [msg, setMsg] = useState('')

  return (
    <BottomSheet onClose={onClose}>
      {/* Avatar */}
      <div className="relative mx-auto mb-md" style={{ width: 100, height: 100 }}>
        <img
          src={user?.photos?.[0] || user?.photo}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 50, border: '2px solid rgba(255,255,255,0.4)' }}
        />
        <div className="absolute emoji-md" style={{ bottom: -8, right: -8 }}>😍</div>
      </div>

      <h2 className="text-h2 font-extra text-center mb-2xs">
        Суперлайк для {user?.name}
      </h2>
      <p className="text-small text-faint text-center mb-lg">
        Сегодня доступно: 1 суперлайк
      </p>

      <div className="relative mb-lg">
        <textarea
          value={msg}
          onChange={e => setMsg(e.target.value.slice(0, 100))}
          placeholder="Напиши что-нибудь... (необязательно)"
          rows={3}
          className="full-w text-small"
          style={{
            padding: '12px 14px', boxSizing: 'border-box',
            background: 'var(--surface-elev-1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14, color: 'var(--text)', resize: 'none', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <span className="text-caption text-dim" style={{ position: 'absolute', bottom: 8, right: 12 }}>
          {msg.length}/100
        </span>
      </div>

      <button
        onClick={() => { onSend?.(user, msg); onClose() }}
        className="btn-pink mb-sm"
      >
        Поставить суперлайк 😍
      </button>

      <button onClick={onClose} className="btn-ghost text-faint full-w">
        Отмена
      </button>
    </BottomSheet>
  )
}
