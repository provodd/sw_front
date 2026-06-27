import { useRef, useState } from 'react'
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
const ALCOHOL_OPTS = ['Не пью вообще','Иногда выпиваю','Выпиваю часто']
const SMOKE_OPTS = ['Не курю','Иногда курю','Курю']

function triggerSelectionHaptic() {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.()
  } catch {
    // Haptics are best-effort: browser preview and unsupported clients just skip it.
  }
}

function SelectOptions({ options, value, onChange }) {
  return (
    <div className="edit-profile-detail-options stack-xs">
      {options.map(o => {
        const active = value === o
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`edit-profile-detail-option text-body ${active ? 'is-active' : ''}`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

export default function EditProfileDetailModal({ profile, onClose, onSave }) {
  const tabsRef = useRef(null)
  const [tab, setTab] = useState('city')
  const [city, setCity] = useState(profile?.city || '')
  const [zodiac, setZodiac] = useState(profile?.zodiac || '')
  const [height, setHeight] = useState(profile?.height || 170)
  const [kids, setKids] = useState(profile?.kids || '')
  const [alcohol, setAlcohol] = useState(profile?.alcohol || '')
  const [smoke, setSmoke] = useState(profile?.smoke || '')
  const [saving, setSaving] = useState(false)

  const updateHeight = (nextHeight) => {
    if (nextHeight !== height) {
      triggerSelectionHaptic()
      setHeight(nextHeight)
    }
  }

  const save = async (closeSheet) => {
    const currentIndex = TABS.findIndex(t => t.key === tab)
    const nextTab = TABS[currentIndex + 1]
    setSaving(true)
    try {
      await api.updateProfile({ city, zodiac, height, kids, alcohol, smoke })
      onSave?.()
      if (nextTab) {
        setTab(nextTab.key)
        window.requestAnimationFrame(() => {
          const nextButton = tabsRef.current?.querySelector(`[data-tab="${nextTab.key}"]`)
          nextButton?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        })
      } else {
        closeSheet()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      {closeSheet => (
      <div className="edit-profile-detail-sheet">
      <div ref={tabsRef} className="edit-profile-detail-tabs mb-lg">
        <div
          className="segmented-control edit-profile-detail-tabs__control"
          style={{
            '--segment-index': TABS.findIndex(t => t.key === tab),
            '--segment-count': TABS.length,
          }}
        >
          <span className="segmented-control__indicator" aria-hidden="true" />
          {TABS.map(t => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                data-tab={t.key}
                onClick={() => setTab(t.key)}
                className={`segmented-control__item text-body shrink-0 ${active ? 'is-active' : ''}`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="edit-profile-detail-content">
        {tab === 'city' && (
          <div className="edit-profile-detail-input-wrap">
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Введите название"
              className="edit-profile-detail-input text-h3 font-medium"
            />
          </div>
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
              onChange={e => updateHeight(+e.target.value)}
              className="app-range full-w"
              style={{ '--range-progress': `${((height - 140) / 80) * 100}%` }}
            />
          </div>
        )}
        {tab === 'kids'    && <SelectOptions options={KIDS_OPTS}    value={kids}    onChange={setKids}    />}
        {tab === 'alcohol' && <SelectOptions options={ALCOHOL_OPTS} value={alcohol} onChange={setAlcohol} />}
        {tab === 'smoke'   && <SelectOptions options={SMOKE_OPTS}   value={smoke}   onChange={setSmoke}   />}
      </div>

      <button onClick={() => save(closeSheet)} disabled={saving} className="btn-dark edit-profile-detail-save mb-sm">
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>

      <button onClick={closeSheet} className="edit-profile-detail-close btn-ghost text-faint full-w">
        Закрыть
      </button>
      </div>
      )}
    </BottomSheet>
  )
}
