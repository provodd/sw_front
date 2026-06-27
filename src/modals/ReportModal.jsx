import { useState } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'

const REASONS = [
  'Спам',
  'Оскорбительное поведение',
  'Фейковый профиль',
  'Несоответствующие фото',
  'Другое',
]

export default function ReportModal({ user, onClose, onReport }) {
  const [reason, setReason] = useState('')

  return (
    <BottomSheet onClose={onClose}>
      {closeSheet => (
      <>
      <div className="row mb-lg" style={{ gap: 12 }}>
        {(user?.photos?.[0] || user?.photo) && (
          <img
            src={user.photos?.[0] || user.photo}
            alt=""
            className="shrink-0"
            style={{ width: 50, height: 50, borderRadius: 25, objectFit: 'cover' }}
          />
        )}
        <div className="flex-1">
          <h2 className="text-h2 font-extra">Пожаловаться</h2>
          {user?.name && <p className="text-small text-faint">{user.name}</p>}
        </div>
        <span className="emoji-md">⚠️</span>
      </div>

      <div className="stack-xs mb-lg">
        {REASONS.map(r => {
          const active = reason === r
          return (
            <button key={r} onClick={() => setReason(r)} className="text-body" style={{
              width: '100%', padding: '12px 16px', borderRadius: 14, border: 'none',
              background: active ? 'rgba(161,18,87,0.3)' : 'var(--surface-elev-1)',
              outline: active ? '1px solid rgba(161,18,87,0.6)' : 'none',
              color: 'var(--text)', textAlign: 'left', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: active ? 600 : 400,
            }}>{r}</button>
          )
        })}
      </div>

      <button
        onClick={() => { if (reason) { onReport?.(user, reason); closeSheet() } }}
        disabled={!reason}
        className="btn-dark"
      >
        Отправить жалобу
      </button>
      </>
      )}
    </BottomSheet>
  )
}
