import { useState } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'
import api from '../api.js'

const TABS = [
  { key: 'city', label: 'Город' },
  { key: 'zodiac', label: 'Знак зодиака' },
  { key: 'height', label: 'Рост' },
  { key: 'kids', label: 'Дети' },
  { key: 'alcohol', label: 'Алкоголь' },
  { key: 'smoke', label: 'Курение' },
]

const ZODIAC = ['Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы']
const KIDS_OPTS = ['Нет детей','Есть дети','Хочу детей','Не хочу детей']
const ALCOHOL_OPTS = ['Не пью','Иногда','Умеренно','Часто']
const SMOKE_OPTS = ['Не курю','Иногда курю','Курю']

function SelectOptions({ options, value, onChange }) {
  return (
    <div className="stack-xs">
      {options.map(o => {
        const active = value === o
        return (
          <button key={o} onClick={() => onChange(o)} className="text-body" style={{
            padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: active ? 'rgba(161,18,87,0.3)' : 'var(--surface-elev-1)',
            outline: active ? '1px solid rgba(161,18,87,0.6)' : 'none',
            color: 'var(--text)', textAlign: 'left',
            fontFamily: 'inherit', fontWeight: active ? 600 : 400,
          }}>{o}</button>
        )
      })}
    </div>
  )
}

export default function EditProfileDetailModal({ profile, onClose, onSave }) {
  const [tab, setTab] = useState('city')
  const [city, setCity] = useState(profile?.city || '')
  const [zodiac, setZodiac] = useState(profile?.zodiac || '')
  const [height, setHeight] = useState(profile?.height || 170)
  const [kids, setKids] = useState(profile?.kids || '')
  const [alcohol, setAlcohol] = useState(profile?.alcohol || '')
  const [smoke, setSmoke] = useState(profile?.smoke || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.updateProfile({ city, zodiac, height, kids, alcohol, smoke })
      onSave?.()
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      {/* Scrollable tab bar */}
      <div className="mb-lg" style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="row" style={{ gap: 8, width: 'max-content' }}>
          {TABS.map(t => {
            const active = tab === t.key
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className="shrink-0 text-body" style={{
                height: 36, padding: '0 16px', borderRadius: 20, border: 'none',
                background: active
                  ? 'linear-gradient(rgba(255,255,255,0.06),rgba(255,255,255,0.06)), rgba(94,94,94,1)'
                  : 'var(--surface-elev-2)',
                color: active ? 'var(--text)' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: active ? 600 : 400,
              }}>{t.label}</button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ minHeight: 140, marginBottom: 24 }}>
        {tab === 'city' && (
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Введите название"
            className="full-w text-h3 font-regular"
            style={{
              height: 45, padding: '0 20px', borderRadius: 100,
              background: 'rgba(208,208,208,0.25)', border: 'none',
              color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        )}
        {tab === 'zodiac' && (
          <div className="cluster-xs">
            {ZODIAC.map(z => {
              const active = zodiac === z
              return (
                <button key={z} onClick={() => setZodiac(z)} className="text-small" style={{
                  padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  background: active ? '#a11257' : 'var(--surface-elev-3)',
                  color: 'var(--text)', fontFamily: 'inherit',
                }}>{z}</button>
              )
            })}
          </div>
        )}
        {tab === 'height' && (
          <div className="text-center">
            <div className="mb-md text-jumbo font-extra">{height} см</div>
            <input
              type="range" min={140} max={220} value={height}
              onChange={e => setHeight(+e.target.value)}
              className="full-w"
              style={{ accentColor: '#a11257' }}
            />
          </div>
        )}
        {tab === 'kids'    && <SelectOptions options={KIDS_OPTS}    value={kids}    onChange={setKids}    />}
        {tab === 'alcohol' && <SelectOptions options={ALCOHOL_OPTS} value={alcohol} onChange={setAlcohol} />}
        {tab === 'smoke'   && <SelectOptions options={SMOKE_OPTS}   value={smoke}   onChange={setSmoke}   />}
      </div>

      <button onClick={save} disabled={saving} className="btn-dark mb-sm">
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>

      <button onClick={onClose} className="btn-ghost text-faint full-w">
        Закрыть
      </button>
    </BottomSheet>
  )
}
