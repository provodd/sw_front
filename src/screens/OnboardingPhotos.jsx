import { useState } from 'react'
import { Screen } from '../components/ui'

export default function OnboardingPhotos({ onNext }) {
  const [photos, setPhotos] = useState([null, null, null, null])

  const addPhoto = (idx) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      setPhotos(prev => { const n = [...prev]; n[idx] = { url, file }; return n })
    }
    input.click()
  }

  const removePhoto = (e, idx) => {
    e.stopPropagation()
    setPhotos(prev => { const n = [...prev]; n[idx] = null; return n })
  }

  const hasPhoto = photos.some(Boolean)

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
        style={{ width: '100%', maxWidth: 316, gap: 'clamp(16px, 3vh, 28px)' }}
      >
        <div className="text-center">
          <h1 className="text-display font-black">
            Фотографии
          </h1>
          <p className="text-small text-tight text-muted" style={{ marginTop: 6 }}>
            Добавь хотя бы одно фото
          </p>
        </div>

        {/* 2x2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
          {photos.map((photo, idx) => (
            <div
              key={idx}
              onClick={() => addPhoto(idx)}
              className="relative pointer overflow-hidden"
              style={{
                aspectRatio: '1 / 1.3',
                borderRadius: 20,
                background: photo ? 'transparent' : 'rgba(104,11,56,0.6)',
                border: photo ? 'none' : '1.5px solid rgba(249,26,134,0.3)',
                boxShadow: 'var(--shadow-elev)',
              }}
            >
              {photo ? (
                <>
                  <img
                    src={photo.url} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <button
                    onClick={e => removePhoto(e, idx)}
                    className="center text-small"
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.65)', border: 'none',
                      color: 'var(--text)', cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >✕</button>
                </>
              ) : (
                <div className="absolute-fill center">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="17" stroke="rgba(249,26,134,0.6)" strokeWidth="1.5" />
                    <path d="M18 10v16M10 18h16" stroke="rgba(249,26,134,0.9)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => hasPhoto && onNext({ photoFiles: photos.filter(Boolean).map(p => p.file) })}
          disabled={!hasPhoto}
          className="btn-dark text-tight"
        >
          Далее
        </button>
      </div>
    </Screen>
  )
}
