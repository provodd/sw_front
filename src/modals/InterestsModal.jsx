import { useState } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'

const ALL_INTERESTS = ['Животные','Фото/видео','Искусство','Экстрим','Игры','Музыка','Путешествия','Спорт','Книги','Еда']

export default function InterestsModal({ current = [], onClose, onSave }) {
  const [selected, setSelected] = useState(current)

  const toggle = (val) =>
    setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

  return (
    <BottomSheet onClose={onClose}>
      {closeSheet => (
      <>
      <h2 className="text-h2 font-extra text-tight text-center mb-lg">Интересы</h2>

      <div className="cluster-sm" style={{ justifyContent: 'center', marginBottom: 28 }}>
        {ALL_INTERESTS.map(int => {
          const active = selected.includes(int)
          return (
            <button key={int} onClick={() => toggle(int)} className="text-small" style={{
              padding: '8px 18px', borderRadius: 50, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              background: active ? '#a11257' : 'var(--text)',
              color: active ? 'var(--text)' : 'var(--surface-base)',
              fontWeight: active ? 600 : 400,
              transition: 'all var(--transition-fast)',
            }}>{int}</button>
          )
        })}
      </div>

      <button onClick={() => { onSave?.(selected); closeSheet() }} className="btn-dark">
        Сохранить
      </button>
      </>
      )}
    </BottomSheet>
  )
}
