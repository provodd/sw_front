import { useState, useRef, useCallback } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'

const ZODIAC = ['Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы']
const INTERESTS = ['Животные','Фото/видео','Искусство','Экстрим','Игры','Музыка','Путешествия','Спорт','Книги','Еда']

const segBtn = (active) => ({
  flex: 1, height: '100%', cursor: 'pointer', fontFamily: 'inherit',
  background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
  border: 'none',
  borderRadius: active ? 25 : 100,
  color: active ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.45)',
  fontWeight: active ? 600 : 400,
  boxShadow: active ? '0px 2.5px 5px rgba(0,0,0,0.15)' : 'none',
  transition: 'all var(--transition-fast)',
})

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} className="relative pointer shrink-0" style={{
      width: 48, height: 28, borderRadius: 14,
      background: value ? '#34c759' : 'rgba(255,255,255,0.2)',
      transition: 'background var(--transition-fast)',
    }}>
      <div style={{
        position: 'absolute', top: 4, left: value ? 24 : 4,
        width: 20, height: 20, borderRadius: '50%', background: 'var(--text)',
        transition: 'left var(--transition-fast)',
      }} />
    </div>
  )
}

function Thumb({ left, onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="center"
      style={{
        position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
        left, width: 40, height: 40,
        cursor: 'grab', touchAction: 'none', zIndex: 2,
      }}
    >
      <div className="no-pointer shrink-0" style={{
        width: 22, height: 22, borderRadius: '50%',
        background: 'var(--text)', boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
      }} />
    </div>
  )
}

function RangeSlider({ min, max, valueMin, valueMax, onChangeMin, onChangeMax }) {
  const trackRef = useRef(null)
  const dragging = useRef(null)

  const pct = (v) => ((v - min) / (max - min)) * 100

  const valueFromEvent = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(ratio * (max - min) + min)
  }, [min, max])

  const onTrackPointerDown = useCallback((e) => {
    e.preventDefault()
    const val = valueFromEvent(e.clientX)
    const distMin = Math.abs(val - valueMin)
    const distMax = Math.abs(val - valueMax)
    const thumb = distMin <= distMax ? 'min' : 'max'
    dragging.current = thumb
    trackRef.current.setPointerCapture(e.pointerId)
    if (thumb === 'min') onChangeMin(Math.min(val, valueMax - 1))
    else onChangeMax(Math.max(val, valueMin + 1))
  }, [valueFromEvent, valueMin, valueMax, onChangeMin, onChangeMax])

  const onPointerDown = (thumb) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = thumb
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return
    const val = valueFromEvent(e.clientX)
    if (dragging.current === 'min') onChangeMin(Math.min(val, valueMax - 1))
    else onChangeMax(Math.max(val, valueMin + 1))
  }, [valueFromEvent, valueMin, valueMax, onChangeMin, onChangeMax])

  const onPointerUp = () => { dragging.current = null }

  const leftPct = pct(valueMin)
  const rightPct = pct(valueMax)

  return (
    <div
      ref={trackRef}
      onPointerDown={onTrackPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="relative"
      style={{ height: 8, borderRadius: 4, background: 'rgba(116,116,116,0.5)', margin: '12px 0', touchAction: 'none' }}
    >
      <div style={{
        position: 'absolute', top: 0, height: '100%', borderRadius: 4,
        background: '#a11257', left: `${leftPct}%`, width: `${rightPct - leftPct}%`,
      }} />
      <Thumb left={`${leftPct}%`} onPointerDown={onPointerDown('min')} />
      <Thumb left={`${rightPct}%`} onPointerDown={onPointerDown('max')} />
    </div>
  )
}

function SingleSlider({ min, max, value, onChange }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)

  const pct = ((value - min) / (max - min)) * 100

  const valueFromEvent = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(ratio * (max - min) + min)
  }, [min, max])

  const onTrackPointerDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    trackRef.current.setPointerCapture(e.pointerId)
    onChange(valueFromEvent(e.clientX))
  }, [valueFromEvent, onChange])

  const onThumbPointerDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return
    onChange(valueFromEvent(e.clientX))
  }, [valueFromEvent, onChange])

  const onPointerUp = () => { dragging.current = false }

  return (
    <div
      ref={trackRef}
      onPointerDown={onTrackPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="relative"
      style={{ height: 8, borderRadius: 4, background: 'rgba(116,116,116,0.5)', margin: '12px 0', touchAction: 'none' }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, height: '100%',
        width: `${pct}%`, background: '#a11257', borderRadius: 4,
      }} />
      <Thumb left={`${pct}%`} onPointerDown={onThumbPointerDown} />
    </div>
  )
}

export default function FiltersModal({ onClose, onApply, isPremium = false, userGender }) {
  const defaultGender = userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : 'all'
  const [gender, setGender] = useState(defaultGender)
  const [ageMin, setAgeMin] = useState(18)
  const [ageMax, setAgeMax] = useState(80)
  const [distance, setDistance] = useState(50)
  const [heightMin, setHeightMin] = useState(140)
  const [heightMax, setHeightMax] = useState(220)
  const [zodiac, setZodiac] = useState([])
  const [interests, setInterests] = useState([])
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [onlyPremium, setOnlyPremium] = useState(false)

  const toggleChip = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])

  const reset = () => {
    setGender(defaultGender); setAgeMin(18); setAgeMax(80); setDistance(50)
    setHeightMin(140); setHeightMax(220); setZodiac([]); setInterests([])
    setOnlyVerified(false); setOnlyPremium(false)
  }

  return (
    <BottomSheet onClose={onClose}>
      <div className="row-between mb-lg">
        <h2 className="text-h2 font-extra">Фильтры</h2>
        <button onClick={reset} className="btn-ghost text-body text-muted">Сбросить</button>
      </div>

      {/* Gender — segmented */}
      <div className="mb-xl">
        <div className="row relative overflow-hidden" style={{
          height: 44, borderRadius: 100, padding: 4,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'inset 0 -0.5px 1px rgba(255,255,255,0.3), inset 0 -0.5px 1px rgba(255,255,255,0.25), inset 1px 1.5px 4px rgba(0,0,0,0.08), inset 1px 1.5px 4px rgba(0,0,0,0.1)',
        }}>
          {[['male','Мужчины'],['female','Женщины'],['all','Не важно']].map(([key, label]) => (
            <button key={key} onClick={() => setGender(key)} className="text-body" style={segBtn(gender === key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div className="mb-lg">
        <div className="row-between" style={{ marginBottom: 2 }}>
          <p className="text-body font-bold" style={{ opacity: 0.8 }}>Возраст:</p>
          <span className="text-body text-muted">{ageMin}–{ageMax} лет</span>
        </div>
        <RangeSlider min={18} max={80} valueMin={ageMin} valueMax={ageMax} onChangeMin={setAgeMin} onChangeMax={setAgeMax} />
      </div>

      {/* Distance */}
      <div className="mb-lg">
        <div className="row-between" style={{ marginBottom: 2 }}>
          <p className="text-body font-bold" style={{ opacity: 0.8 }}>Расстояние:</p>
          <span className="text-body text-muted">0–{distance} км</span>
        </div>
        <SingleSlider min={1} max={100} value={distance} onChange={setDistance} />
      </div>

      {/* Premium filters */}
      {isPremium ? (
        <>
          {/* Height */}
          <div className="mb-lg">
            <div className="row-between" style={{ marginBottom: 2 }}>
              <p className="text-body font-bold" style={{ opacity: 0.8 }}>Рост:</p>
              <span className="text-body text-muted">{heightMin}–{heightMax} см</span>
            </div>
            <RangeSlider min={140} max={220} valueMin={heightMin} valueMax={heightMax} onChangeMin={setHeightMin} onChangeMax={setHeightMax} />
          </div>

          {/* Zodiac */}
          <div className="mb-lg">
            <p className="mb-sm text-body font-bold">Знак зодиака</p>
            <div className="cluster-xs">
              {ZODIAC.map(z => {
                const active = zodiac.includes(z)
                return (
                  <button key={z} onClick={() => toggleChip(zodiac, setZodiac, z)} className="text-small font-semi" style={{
                    padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: active ? '#a11257' : 'var(--text)',
                    color: active ? 'var(--text)' : 'var(--surface-base)',
                  }}>{z}</button>
                )
              })}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-lg">
            <p className="mb-sm text-body font-bold">Интересы</p>
            <div className="cluster-xs">
              {INTERESTS.map(int => {
                const active = interests.includes(int)
                return (
                  <button key={int} onClick={() => toggleChip(interests, setInterests, int)} className="text-small font-semi" style={{
                    padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: active ? '#a11257' : 'var(--text)',
                    color: active ? 'var(--text)' : 'var(--surface-base)',
                  }}>{int}</button>
                )
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="stack-sm mb-lg">
            {[
              ['✅', 'Только верифицированных', onlyVerified, setOnlyVerified],
              ['🪙', 'Только Premium-аккаунты', onlyPremium, setOnlyPremium],
            ].map(([icon, label, val, set]) => (
              <div key={label} className="row-between" style={{
                background: 'var(--surface-elev-1)', borderRadius: 14, padding: '12px 16px',
              }}>
                <div className="row" style={{ gap: 10 }}>
                  <span className="emoji-sm">{icon}</span>
                  <span className="text-small font-semi">{label}</span>
                </div>
                <Toggle value={val} onChange={set} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="row-between mb-lg" style={{
          background: 'var(--surface-elev-1)', borderRadius: 14, padding: '14px 16px',
        }}>
          <div>
            <p className="text-body font-bold">Дополнительные фильтры</p>
            <p className="text-small text-faint" style={{ marginTop: 3 }}>
              Премиум дает возможность найти того самого человека
            </p>
          </div>
          <div className="center shrink-0 emoji-sm" style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-soft)', border: '1.5px solid rgba(233,30,140,0.6)',
            color: 'var(--accent)', fontWeight: 300,
          }}>+</div>
        </div>
      )}

      <button
        onClick={() => {
          onApply?.({ gender, ageMin, ageMax, distance, heightMin, heightMax, zodiac, interests, onlyVerified, onlyPremium })
          onClose()
        }}
        className="btn-dark"
      >
        Применить
      </button>
    </BottomSheet>
  )
}
