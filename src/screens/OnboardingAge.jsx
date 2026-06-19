import { useState, useRef, useEffect } from 'react'
import { Screen } from '../components/ui'

const MIN_AGE = 18
const MAX_AGE = 60
const ages = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i)
const ITEM_H = 60

function haptic() {
  try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light') } catch {}
}

export default function OnboardingAge({ onNext }) {
  const [selectedAge, setSelectedAge] = useState(25)
  const listRef = useRef(null)
  const lastAge = useRef(25)

  useEffect(() => {
    const idx = ages.indexOf(25)
    if (listRef.current) listRef.current.scrollTop = idx * ITEM_H
  }, [])

  const handleScroll = () => {
    if (!listRef.current) return
    const idx = Math.round(listRef.current.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(ages.length - 1, idx))
    const age = ages[clamped]
    if (age !== lastAge.current) {
      lastAge.current = age
      setSelectedAge(age)
      haptic()
    }
  }

  const getStyle = (age) => {
    const diff = Math.abs(age - selectedAge)
    if (diff === 0) return { fontSize: 64, fontWeight: 700, opacity: 1 }
    if (diff === 1) return { fontSize: 48, fontWeight: 400, opacity: 0.5 }
    if (diff === 2) return { fontSize: 40, fontWeight: 400, opacity: 0.3 }
    return { fontSize: 32, fontWeight: 400, opacity: 0.15 }
  }

  return (
    <Screen
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

      {/* Drum roller */}
      <div style={{ position: 'relative', width: 160, height: ITEM_H * 5, overflow: 'hidden' }}>
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
          style={{
            height: '100%',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            paddingTop: ITEM_H * 2,
            paddingBottom: ITEM_H * 2,
          }}
        >
          <style>{`div::-webkit-scrollbar{display:none}`}</style>
          {ages.map(age => {
            const s = getStyle(age)
            return (
              <div
                key={age}
                className="center pointer"
                style={{
                  height: ITEM_H,
                  scrollSnapAlign: 'center',
                  fontSize: s.fontSize, fontWeight: s.fontWeight,
                  opacity: s.opacity,
                  transition: 'all 0.15s',
                }}
                onClick={() => {
                  setSelectedAge(age)
                  lastAge.current = age
                  haptic()
                  const idx = ages.indexOf(age)
                  listRef.current.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
                }}
              >{age}</div>
            )
          })}
        </div>
      </div>

      <button
        onClick={() => onNext({ age: selectedAge })}
        className="btn-dark text-tight"
      >
        Далее
      </button>
    </Screen>
  )
}
