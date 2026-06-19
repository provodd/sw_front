import { useState } from 'react'
import { Screen } from '../components/ui'

const GENDERS = [
  { value: 'female', label: 'Я девушка', icon: '/icons/gender-female.svg' },
  { value: 'male',   label: 'Я парень',  icon: '/icons/gender-male.svg'   },
]

export default function OnboardingGender({ onNext }) {
  const [gender, setGender] = useState(null)

  return (
    <Screen
      variant="gradient"
      centered
      scroll={false}
      style={{
        padding: '0 24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
      }}
    >
      <div
        className="stack-lg center"
        style={{ width: '100%', maxWidth: 280, gap: 'clamp(20px, 4vh, 40px)' }}
      >
        <h1 className="text-display font-black text-tight text-center">Пол</h1>

        <div className="stack-md full-w">
          {GENDERS.map(opt => {
            const selected = gender === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setGender(opt.value)}
                className="center stack-xs"
                style={{
                  height: 'clamp(120px, 22vw, 164px)',
                  borderRadius: 32,
                  background: 'rgba(128,128,128,0.3)',
                  backdropFilter: 'blur(50px)',
                  WebkitBackdropFilter: 'blur(50px)',
                  border: selected
                    ? '2px solid rgba(255,255,255,0.9)'
                    : '1.4px solid rgba(255,255,255,0.15)',
                  boxShadow: selected
                    ? '0 0 0 3px rgba(255,255,255,0.15), 0 4px 4px rgba(0,0,0,0.25)'
                    : '0 4px 4px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  flexDirection: 'column',
                  padding: 16,
                  fontFamily: 'inherit',
                  transition: 'border var(--transition-fast), box-shadow var(--transition-fast)',
                }}
              >
                <img src={opt.icon} alt={opt.label} style={{ width: 64, height: 64, objectFit: 'contain' }} />
                <span className="text-h3 text-tight font-medium">{opt.label}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => gender && onNext({ gender })}
          disabled={!gender}
          className="btn-dark text-tight"
        >
          Далее
        </button>
      </div>
    </Screen>
  )
}
