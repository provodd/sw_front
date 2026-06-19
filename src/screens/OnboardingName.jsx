import { useState } from 'react'
import Sticker from '../components/Sticker.jsx'
import { Screen } from '../components/ui'

export default function OnboardingName({ onNext }) {
  const [name, setName] = useState('')
  const canProceed = name.trim().length > 0

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
        style={{ width: '100%', maxWidth: 316, gap: 'clamp(18px, 4vh, 35px)' }}
      >
        <Sticker
          index={4}
          size={Math.min(195, Math.round(window.innerWidth * 0.5))}
          loop
          autoplay
        />

        <h1 className="text-display font-extra text-tight text-center">
          Привет!
        </h1>

        <p className="text-body text-tight text-center leading-loose">
          Свайпик — это самое удобное приложение для знакомств.
          <br /><br />
          Давай создадим твою страницу,<br />как тебя зовут?
        </p>

        <div className="stack-sm" style={{ width: '100%', maxWidth: 244, gap: 15 }}>
          {/* Glass-input from Figma (mix-blend-mode layers) */}
          <div style={{ position: 'relative', height: 45, borderRadius: 100, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 100,
              background: 'rgba(208,208,208,0.5)',
              mixBlendMode: 'color-burn',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 100,
              background: 'rgba(0,0,0,0.1)',
              mixBlendMode: 'luminosity',
            }} />
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 100, pointerEvents: 'none',
              boxShadow: 'inset 0px -0.5px 1px rgba(255,255,255,0.3), inset 0px -0.5px 1px rgba(255,255,255,0.25), inset 1px 1.5px 4px rgba(0,0,0,0.08), inset 1px 1.5px 4px rgba(0,0,0,0.1)',
            }} />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canProceed && onNext({ name: name.trim() })}
              placeholder="Имя:"
              maxLength={30}
              autoFocus
              className="text-h3 font-medium"
              style={{
                position: 'absolute', inset: 0,
                background: 'transparent', border: 'none', outline: 'none',
                color: name ? 'var(--text)' : '#545454',
                fontFamily: 'inherit',
                padding: '0 22px', width: '100%', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={() => canProceed && onNext({ name: name.trim() })}
            disabled={!canProceed}
            className="btn-dark text-tight"
          >
            Далее
          </button>
        </div>
      </div>
    </Screen>
  )
}
