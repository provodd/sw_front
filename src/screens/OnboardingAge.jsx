import { useState, useRef, useEffect, useMemo } from 'react'
import { Screen } from '../components/ui'

const MIN_AGE = 18
const MAX_AGE = 80
const ITEM_H = 60
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function haptic() {
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light') } catch {}
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function calculateAge({ day, month, year }) {
  const today = new Date()
  let age = today.getFullYear() - year
  const birthdayThisYear = new Date(today.getFullYear(), month - 1, day)
  if (today < birthdayThisYear) age -= 1
  return age
}

function fallbackBirthDate(age = 25) {
  const today = new Date()
  return {
    day: today.getDate(),
    month: today.getMonth() + 1,
    year: today.getFullYear() - clamp(age, MIN_AGE, MAX_AGE),
  }
}

function normalizeInitialDate({ initialAge, initialBirthDay, initialBirthMonth, initialBirthYear }) {
  const fallback = fallbackBirthDate(initialAge)
  const now = new Date()
  const minYear = now.getFullYear() - MAX_AGE
  const maxYear = now.getFullYear() - MIN_AGE
  const year = clamp(Number(initialBirthYear) || fallback.year, minYear, maxYear)
  const month = clamp(Number(initialBirthMonth) || fallback.month, 1, 12)
  const day = clamp(Number(initialBirthDay) || fallback.day, 1, daysInMonth(year, month))
  return { day, month, year }
}

function getStyle(value, selectedValue, compact = false) {
  const diff = Math.abs(value - selectedValue)
  if (diff === 0) return { fontSize: compact ? 42 : 48, fontWeight: 700, opacity: 1 }
  if (diff === 1) return { fontSize: compact ? 32 : 38, fontWeight: 400, opacity: 0.5 }
  if (diff === 2) return { fontSize: compact ? 27 : 32, fontWeight: 400, opacity: 0.3 }
  return { fontSize: compact ? 23 : 28, fontWeight: 400, opacity: 0.15 }
}

function DrumWheel({ values, selected, onSelect, width, compact = false, ariaLabel }) {
  const listRef = useRef(null)
  const lastValue = useRef(selected)

  useEffect(() => {
    lastValue.current = selected
    const idx = values.indexOf(selected)
    if (idx >= 0 && listRef.current) listRef.current.scrollTop = idx * ITEM_H
  }, [selected, values])

  const handleScroll = () => {
    if (!listRef.current) return
    const idx = Math.round(listRef.current.scrollTop / ITEM_H)
    const clamped = clamp(idx, 0, values.length - 1)
    const next = values[clamped]
    if (next !== lastValue.current) {
      lastValue.current = next
      onSelect(next)
      haptic()
    }
  }

  return (
    <div style={{ position: 'relative', width, height: ITEM_H * 5, overflow: 'hidden', flex: '0 0 auto' }}>
      <div style={{
        position: 'absolute', top: '40%', left: 0, right: 0,
        height: 1.5, background: 'rgba(255,255,255,0.5)',
        pointerEvents: 'none', zIndex: 3,
      }} />
      <div style={{
        position: 'absolute', top: '60%', left: 0, right: 0,
        height: 1.5, background: 'rgba(255,255,255,0.5)',
        pointerEvents: 'none', zIndex: 3,
      }} />

      <div
        ref={listRef}
        onScroll={handleScroll}
        aria-label={ariaLabel}
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          paddingTop: ITEM_H * 2,
          paddingBottom: ITEM_H * 2,
        }}
      >
        {values.map(value => {
          const s = getStyle(value, selected, compact)
          return (
            <div
              key={value}
              className="center pointer"
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'center',
                fontSize: `clamp(${Math.max(20, s.fontSize - 6)}px, ${compact ? 8.5 : 10}vw, ${s.fontSize}px)`,
                fontWeight: s.fontWeight,
                opacity: s.opacity,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onClick={() => {
                lastValue.current = value
                onSelect(value)
                haptic()
                const idx = values.indexOf(value)
                listRef.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
              }}
            >{value}</div>
          )
        })}
      </div>
    </div>
  )
}

export default function OnboardingAge({
  onNext,
  initialAge = 25,
  initialBirthDay,
  initialBirthMonth,
  initialBirthYear,
  submitLabel = 'Далее',
  className = '',
}) {
  const initial = normalizeInitialDate({ initialAge, initialBirthDay, initialBirthMonth, initialBirthYear })
  const [day, setDay] = useState(initial.day)
  const [month, setMonth] = useState(initial.month)
  const [year, setYear] = useState(initial.year)

  const years = useMemo(() => {
    const now = new Date()
    const minYear = now.getFullYear() - MAX_AGE
    const maxYear = now.getFullYear() - MIN_AGE
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
  }, [])

  const days = useMemo(() => (
    Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1)
  ), [month, year])

  useEffect(() => {
    const maxDay = daysInMonth(year, month)
    if (day > maxDay) setDay(maxDay)
  }, [day, month, year])

  const save = () => {
    const birthDate = { day, month, year }
    onNext({
      age: calculateAge(birthDate),
      birth_day: day,
      birth_month: month,
      birth_year: year,
    })
  }

  return (
    <Screen
      className={className}
      variant="gradient"
      centered
      scroll={false}
      style={{
        padding: '0 24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
        gap: 'clamp(24px, 5vh, 48px)',
        alignItems: 'center',
      }}
    >
      <h1 className="text-display font-black text-tight text-center">Возраст</h1>

      <style>{`div::-webkit-scrollbar{display:none}`}</style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'clamp(8px, 2.4vw, 12px)',
          width: 'min(100%, 350px)',
        }}
      >
        <DrumWheel
          values={days}
          selected={day}
          onSelect={setDay}
          width="clamp(68px, 20vw, 82px)"
          ariaLabel="День рождения"
        />
        <DrumWheel
          values={MONTHS}
          selected={month}
          onSelect={setMonth}
          width="clamp(68px, 20vw, 82px)"
          ariaLabel="Месяц рождения"
        />
        <DrumWheel
          values={years}
          selected={year}
          onSelect={setYear}
          width="clamp(116px, 32vw, 132px)"
          compact
          ariaLabel="Год рождения"
        />
      </div>

      <button
        onClick={save}
        className="btn-dark text-tight"
      >
        {submitLabel}
      </button>
    </Screen>
  )
}
