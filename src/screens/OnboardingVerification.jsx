import { Screen } from '../components/ui'

export default function OnboardingVerification({ onNext }) {
  return (
    <Screen variant="gradient" scroll={false} style={{ padding: '0 24px', alignItems: 'center' }}>
      <div className="flex-1 stack-lg center text-center">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="45" cy="45" r="44" fill="rgba(249,26,134,0.15)" stroke="rgba(249,26,134,0.5)" strokeWidth="2" />
          <path d="M45 18L24 27v18c0 12.15 9 23.52 21 26.33C57 68.52 66 57.15 66 45V27L45 18z" fill="rgba(249,26,134,0.3)" stroke="#F91A86" strokeWidth="2" />
          <path d="M36 45l6 6 12-12" stroke="#F91A86" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h1 className="text-h1 font-black text-tight">Верификация</h1>

        <p className="text-small text-muted leading-loose" style={{ maxWidth: 280 }}>
          Свайпик не любит фейков, ботов и прочих скамеров!
        </p>
        <p className="text-small text-muted leading-loose" style={{ maxWidth: 280 }}>
          Чтобы начать знакомиться, необходимо пройти верификацию и сделать селфи.
        </p>
        <p className="text-caption text-dim">
          Не переживай, это фото никто не увидит!
        </p>
      </div>

      <div className="stack-sm" style={{ width: '100%', maxWidth: 280, marginBottom: 48 }}>
        <button onClick={() => onNext({ verified: true })} className="btn-dark font-bold">
          Пройти верификацию
        </button>
        <button onClick={() => onNext({ verified: false })} className="btn-ghost text-faint text-small">
          Пропустить
        </button>
      </div>
    </Screen>
  )
}
