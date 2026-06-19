import { Screen } from '../components/ui'

export default function OnboardingGeo({ onNext }) {
  const requestGeo = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onNext({ geo: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
        () => onNext({ geo: null })
      )
    } else {
      onNext({ geo: null })
    }
  }

  return (
    <Screen variant="gradient" scroll={false} style={{ padding: '0 24px', alignItems: 'center' }}>
      <div className="flex-1 stack-lg center text-center">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="45" cy="45" r="44" fill="rgba(249,26,134,0.15)" stroke="rgba(249,26,134,0.5)" strokeWidth="2" />
          <path d="M45 20C36.72 20 30 26.72 30 35c0 12.75 15 35 15 35s15-22.25 15-35c0-8.28-6.72-15-15-15zm0 20.25a5.25 5.25 0 110-10.5 5.25 5.25 0 010 10.5z" fill="#F91A86" />
        </svg>

        <h1 className="text-display font-black text-tight">Геолокация</h1>

        <p className="text-body text-muted leading-loose" style={{ maxWidth: 280 }}>
          Чтобы знакомиться с людьми поблизости, необходимо предоставить доступ к геолокации
        </p>
      </div>

      <div className="stack-sm" style={{ width: '100%', maxWidth: 280, marginBottom: 48 }}>
        <button onClick={requestGeo} className="btn-pink font-bold">
          Разрешить геолокацию
        </button>
        <button onClick={() => onNext({ geo: null })} className="btn-ghost text-faint text-small">
          Пропустить
        </button>
      </div>
    </Screen>
  )
}
