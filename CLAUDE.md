# Swaypik — Design System Rules (песочница)

## Что это

**Песочница для дизайна экранов Swaypik** — дейтинг-приложения внутри Telegram
(Telegram Mini App). Только мобильный веб, вьюпорт ~320–430px шириной.

- Стек: **React 18 + Vite 5**, чистый JSX (без TypeScript).
- **Бэкенда здесь нет.** Все данные отдаёт мок `src/api.js` — приложение
  запускается и рендерится без сервера. Подробности запуска и переключения
  состояний — в `README.md`.
- Цель: дорабатывать/перерисовывать экраны **на существующих компонентах и
  токенах**, чтобы результат вставлялся в боевой проект без переписывания.

**Правило стека:** никаких новых style/UI-зависимостей (нет Tailwind, CSS
Modules, styled-components, Emotion, Sass). Только обычный CSS + React +
дизайн-токены.

**Не редактировать** (это заглушки песочницы, в проект не возвращаются):
`src/api.js` (кроме блока `CONFIG`), `src/components/Sticker.jsx`, `vite.config.js`.

---

## Design System (правила)

Система состоит из **трёх слоёв**, в порядке предпочтения. Когда пишешь JSX,
тянись к самому верхнему слою.

```
Слой 3 — React-примитивы   (src/components/ui/*)
Слой 2 — Утилити-классы     (src/styles.css)
Слой 1 — Дизайн-токены      (CSS-переменные в :root)
```

**Инлайновый `style={{}}` — только для динамических значений** (размеры/цвета из
props/state/API, у которых нет классового эквивалента). Статичные структурные
стили — через классы.

### Что использовать

| Нужно | Используй |
|------|-----|
| Полноэкранный контейнер | `<Screen>` |
| Заголовок страницы | `<ScreenHeader title="..." />` |
| Glass-карточка | `<GlassCard>` (или `className="glass"` для не-div) |
| Круглая иконка-кнопка (close, fav и т.п.) | `<CircleIconButton>` |
| Пустое состояние списка | `<EmptyState emoji title description />` |
| Полноэкранный лоадер | `<LoadingState />` |
| Синяя галочка верификации | `<VerifiedBadge size />` |
| Pill-тег с текстом | `<Chip variant>` |
| Тёмный градиент-фейд над фото | `<FadeOverlay />` |
| Вертикальный стек | `className="stack-md"` (или `stack-{xs..xl}`) |
| Центрированный flex | `className="center"` |
| Отступы/гэп | `className="p-md"`, `mb-lg`, `gap-sm` и т.д. |
| Заголовочный текст | `className="text-h1 text-tight"` |
| Body-текст | `className="text-body"` |
| Приглушённый текст | `className="text-muted"` (`text-faint`, `text-dim`) |
| Розовая CTA-кнопка | `className="btn-pink"` (или `btn-pink--sm`, `btn-pink--ghost`) |
| Тёмная кнопка | `className="btn-dark"` |
| Telegram CTA | `className="btn-tg"` |
| Брендовый цвет в инлайне | `var(--accent)` (никогда `#E91E8C`) |

---

## Слой 1 — Дизайн-токены

Все токены — в `src/styles.css` `:root`. Обращайся через `var(--token-name)`.

### Цвета

```
--surface-base       #000
--surface-elev-1     rgba(255,255,255,0.04)
--surface-elev-2     rgba(255,255,255,0.08)
--surface-elev-3     rgba(255,255,255,0.12)
--surface-glass      <многослойный градиент для .glass>
--surface-glass-soft rgba(120,120,120,0.22)

--accent             #E91E8C
--accent-2           #FF4DB3
--accent-grad        linear-gradient(135deg, …)

--success / --error / --tg-blue / --gold

--text               #fff
--text-muted         rgba(255,255,255,0.7)
--text-faint         rgba(255,255,255,0.5)
--text-dim           rgba(255,255,255,0.3)

--bg-onboarding / --bg-app   <радиальный градиент F91A86 → #000>
--gradient-fade-bottom / --gradient-fade-top
```

### Типографика (fluid через `clamp()`)

```
--text-display   clamp(28px, 8vw,   36px)
--text-h1        clamp(24px, 7vw,   32px)
--text-h2        clamp(18px, 5.5vw, 22px)
--text-h3        clamp(16px, 4.5vw, 18px)
--text-body      clamp(14px, 4vw,   16px)
--text-small     clamp(12px, 3.5vw, 14px)
--text-caption   clamp(10px, 3vw,   12px)

--tracking-tight    -0.3px
--tracking-tighter  -0.5px
--font-{regular medium semi bold extra black}  400..900
```

### Спейсинг

```
--space-2xs 4px / --space-xs 8px
--space-sm clamp(10px,3vw,12px) / --space-md clamp(12px,3.5vw,16px)
--space-lg clamp(16px,4.5vw,20px) / --space-xl clamp(20px,5.5vw,28px)
--space-2xl clamp(28px,7vw,40px) / --space-3xl clamp(40px,10vw,60px)
--gutter 14px            /* горизонтальный отступ от края экрана */
--header-pad-top 100px   /* безопасный верх TG webapp */
```

### Радиусы / Тени / Z-index / Анимации

```
--radius-sm 12px / --radius-md 20px / --radius-lg 30px / --radius-pill 50px / --radius-circle 50%
--shadow-card / --shadow-elev / --shadow-modal
--z-base 1 / --z-overlay 10 / --z-sticky 50 / --z-nav 100 / --z-modal 1000 / --z-toast 2000
--transition-fast 150ms / --transition 250ms / --transition-slow 400ms
--blur-glass blur(50px) / --blur-soft blur(16px)
```

---

## Слой 2 — Утилити-классы

Все в `src/styles.css`. Композируются через пробел.

**Лейаут:** `.screen`, `.screen--gradient`, `.screen--black`, `.screen--centered`,
`.screen--with-nav`, `.stack-{2xs..2xl}`, `.cluster-{2xs..lg}`, `.row`,
`.row-between`, `.center`, `.full`, `.full-w`, `.flex-1`, `.shrink-0`

**Спейсинг:** `.p-{2xs..xl}`, `.px-gutter`, `.px-md`, `.px-lg`, `.py-{xs..lg}`,
`.mb-{2xs..xl}`, `.mt-{xs..xl}`, `.gap-{xs..lg}`, `.mx-auto`

**Типографика:** `.text-display`, `.text-h1`..`.text-caption`, `.text-muted`,
`.text-faint`, `.text-dim`, `.text-accent`, `.text-tg`, `.text-gold`, `.text-tight`,
`.text-tighter`, `.text-center`, `.text-right`, `.font-{medium semi bold extra black}`

**Поверхности:** `.glass`, `.glass-soft`, `.fade-bottom`

**Кнопки:** `.btn-pink`, `.btn-pink--sm`, `.btn-pink--ghost`, `.btn-dark`,
`.btn-tg`, `.btn-ghost`

**Прочее:** `.hidden`, `.relative`, `.absolute`, `.absolute-fill`, `.no-pointer`,
`.pointer`, `.overflow-hidden`, `.truncate`

---

## Слой 3 — React-примитивы (`src/components/ui/`)

Импорт из бочки:
```jsx
import { Screen, ScreenHeader, GlassCard, CircleIconButton, EmptyState, LoadingState, BackButton, CloseButton, VerifiedBadge, Chip, FadeOverlay } from '../components/ui'
```

Типичный экран:
```jsx
import { Screen, ScreenHeader, GlassCard } from '../components/ui'

export default function ProfileScreen() {
  return (
    <Screen withNav>
      <ScreenHeader title="ПРОФИЛЬ" />
      <div className="px-gutter stack-md">
        <GlassCard className="p-md">
          <p className="text-body">…</p>
        </GlassCard>
      </div>
    </Screen>
  )
}
```

---

## State / данные

- Локальный `useState` — без Redux и Context.
- Данные грузятся в `useEffect` через `api` (в песочнице это мок).
- Роутинг экранов — в `App.jsx` через state `tab` и `screen`.

```jsx
import api from '../api'
useEffect(() => { api.getSomething().then(setData) }, [])
```

Сигнатуры методов `api` в песочнице 1:1 совпадают с боевыми — менять вызовы
не нужно, формы данных те же.

## Иконки

- Публичные SVG в `public/icons/` — как `/icons/<name>.svg`
- Иконки нав-бара в `BottomNav.jsx` — инлайновый SVG с динамическим цветом
- Библиотек иконок нет.

## Ассеты

- Статика в `public/` → `/images/...`, `/icons/...`
- Стикеры рендерятся через `<Sticker>` (в песочнице — эмодзи-заглушка).

## Мобайл / Telegram WebApp

- Только мобильный — без десктоп/планшет адаптива.
- Вьюпорт: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- Тап-хайлайт и user-select отключены глобально в styles.css.
- Хаптика и Telegram-API (`window.Telegram?.WebApp?...`) в браузере просто
  no-op — это нормально.
- Safe area снизу: `padding-bottom: max(24px, env(safe-area-inset-bottom, 24px))`

---

## Правила работы

1. **Тяни к высшему слою:** примитив → утилити-класс → токен. Инлайн-стиль —
   только для динамики.
2. **Не дублируй инлайном** то, что уже есть классом/примитивом. Если паттерн
   встречается в 3+ местах и его нет — вынеси.
3. **Никаких хардкод брендовых цветов** — используй `var(--accent)`, `var(--text)`
   и т.д. Хексы вроде `#E91E8C` в файлах экранов не должны появляться.
4. **Никаких новых style-зависимостей.**

## Figma → Code

1. Цвета Figma → токены `:root` (не вставлять сырой хекс в JSX).
2. Спейсинг Figma → шкала `--space-*` (fluid).
3. Типографику Figma → шкала `--text-*`.
4. Только мобильный вьюпорт — десктоп-фреймы игнорировать.
5. Шрифт всегда Nunito.
6. Кнопки → `.btn-pink` / `.btn-dark` / `.btn-tg` (или варианты).
7. Экран → `<Screen>`. Glass → `<GlassCard>` / `.glass`. Галочка → `<VerifiedBadge>` и т.д.
8. Никаких новых style-зависимостей.
