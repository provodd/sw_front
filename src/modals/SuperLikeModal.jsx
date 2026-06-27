import { useState } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'

export default function SuperLikeModal({ user, onClose, onSend, superlikeLeft = 1 }) {
  const [msg, setMsg] = useState('')

  return (
    <BottomSheet onClose={onClose}>
      {closeSheet => (
        <div className="superlike-sheet">
          <div className="superlike-sheet__intro">
            <div className="superlike-sheet__avatar-wrap">
              <img
                className="superlike-sheet__avatar"
                src={user?.photos?.[0] || user?.photo}
                alt={user?.name || ''}
              />
              <span className="superlike-sheet__badge">
                <img src="/icons/superlike.svg" alt="" />
              </span>
            </div>

            <h2 className="superlike-sheet__title">Суперлайк</h2>
            <p className="superlike-sheet__description">
              Напиши что-нибудь приятное, это сообщение точно увидят!
            </p>
          </div>

          <div className="superlike-sheet__message">
            <div className="superlike-sheet__message-meta">
              <span>Сообщение</span>
              <span>{msg.length}/100</span>
            </div>
            <textarea
              value={msg}
              onChange={event => setMsg(event.target.value.slice(0, 100))}
              placeholder="Действуй нестандартно!"
              rows={3}
              aria-label={`Сообщение для ${user?.name || 'пользователя'}`}
            />
          </div>

          <div className="superlike-sheet__available">
            <span>Сегодня доступно:</span>
            <span className="card-dark">
              {superlikeLeft} {superlikeLeft === 1 ? 'суперлайк' : 'суперлайка'}
            </span>
          </div>

          <button
            onClick={() => {
              closeSheet()
              window.setTimeout(() => onSend?.(user, msg), 280)
            }}
            className="superlike-sheet__submit"
          >
            Поставить суперлайк
          </button>

          <button
            type="button"
            onClick={closeSheet}
            className="superlike-sheet__cancel"
          >
            Отмена
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
