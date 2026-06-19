import { Screen } from '../components/ui'

/**
 * Промо-экран мем-теста на регистрации (Figma 5099-540).
 * Пропускаемый шаг: «Стартуем!» → колода мемов, «Пройти позже» → в приложение.
 */
export default function OnboardingMemeIntro({ onStart, onSkip }) {
  return (
    <Screen variant="gradient" scroll={false} style={{ padding: '0 24px', alignItems: 'center' }}>
      <h1 className="text-display font-extra text-tight text-center" style={{ marginTop: 'clamp(64px, 14vh, 116px)' }}>
        Мем-тест
      </h1>

      <div className="overflow-hidden shrink-0" style={{
        width: 'min(225px, 60vw)', aspectRatio: '225/246', borderRadius: 13,
        marginTop: 'clamp(28px, 6vh, 56px)', background: '#000',
      }}>
        <img src="/mem/img.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
      </div>

      <div className="stack-lg center text-center" style={{ marginTop: 'clamp(28px, 6vh, 50px)', maxWidth: 331 }}>
        <p className="text-h2 font-extra text-tight">
          Посчитаем совместимость на основе ваших любимых мемов
        </p>
        <p className="text-body text-tight">
          Мемы — это не просто смешные картинки. Это культурный код и универсальный
          язык, позволяющий моментально понять, что у вас общий вайб
        </p>
      </div>

      <div className="stack-sm" style={{ width: '100%', maxWidth: 244, margin: 'auto 0 48px' }}>
        <button onClick={onStart} className="btn-dark font-medium">
          Стартуем!
        </button>
        <button onClick={onSkip} className="btn-ghost text-body mx-auto" style={{ display: 'block' }}>
          Пройти позже
        </button>
      </div>
    </Screen>
  )
}
