export const ACHIEVEMENT_VISIBILITY_STORAGE_KEY = 'swipik_visible_profile_achievements'

export const ACHIEVEMENT_CATALOG = [
  { key: 'pioneer', title: 'ЛЕГЕНДА', subtitle: 'Быть в первой тысяче юзеров', desc: 'Редкое достижение, доступное только первой тысяче юзеров', detailDesc: 'Редкое достижение, доступное только тысяче первых юзеров', image: '/images/achievements/legend.png', tone: 'accent' },
  { key: 'first', title: 'Ты у меня первый', subtitle: 'Сделать свой первый свайп', desc: 'Сделать свой первый свайп', detailDesc: 'Всё когда то бывает впервые', image: '/images/achievements/first-swipe.png' },
  { key: 'dislikes', title: 'Король дизлайков', subtitle: 'Получить 10 000 дизлайков', desc: 'Получить 10 000 дизлайков', detailDesc: 'Редкое достижение. Главное никогда не отчаиваться!', image: '/images/achievements/king-dislikes.png', tone: 'accent' },
  { key: 'online_10', title: '10 дней онлайна', subtitle: 'Заходить в приложение 10 дней подряд', desc: 'Заходить в приложение 10 дней подряд', detailDesc: 'Да, да, мы все тут чисто по приколу...', image: '/images/achievements/online-10.png' },
  { key: 'online_30', title: '30 дней онлайна', subtitle: 'Заходить в приложение 30 дней подряд', desc: 'Заходить в приложение 30 дней подряд', detailDesc: 'В свайпик как на работу\n(зп не будет)', image: '/images/achievements/online-30.png' },
  { key: 'online_100', title: '100 дней онлайна', subtitle: 'Заходить в приложение 100 дней подряд', desc: 'Заходить в приложение 100 дней подряд', detailDesc: 'Ты здесь дольше, чем некоторые сотрудники', image: '/images/achievements/online-100.png' },
  { key: 'friends_5', title: 'Душа компании', subtitle: 'Пригласить 5 друзей', desc: 'Пригласить 5 друзей', detailDesc: 'Тебя не скипнули, цени их!', image: '/images/achievements/friends-5.png' },
  { key: 'friends_10', title: 'Экстраверт', subtitle: 'Пригласить 10 друзей', desc: 'Пригласить 10 друзей', detailDesc: 'С тобой опасно спорить', image: '/images/achievements/friends-10.png' },
  { key: 'friends_50', title: 'Инфлюенсер', subtitle: 'Пригласить 50 друзей', desc: 'Пригласить 50 друзей', detailDesc: 'Ты хайп-машина!', image: '/images/achievements/friends-50.png' },
  { key: 'swipes_5000', title: 'Не жалея пальца', subtitle: 'Сделать 5000 свайпов', desc: 'Сделать 5000 свайпов', detailDesc: 'У тебя особый вкус', image: '/images/achievements/swipes-5000.png' },
  { key: 'swipes_10000', title: 'Палец судьбы', subtitle: 'Сделать 10 000 свайпов', desc: 'Сделать 10 000 свайпов', detailDesc: 'Ну ты и привереда!', image: '/images/achievements/swipes-10000.png' },
  { key: 'stars_2000', title: 'Саппорт', subtitle: 'Потратить 2000 звезд', desc: 'Потратить 2000 звезд', detailDesc: 'Двигаемся потихоньку', image: '/images/achievements/stars-2000.png' },
  { key: 'stars_5000', title: 'Мажор', subtitle: 'Потратить 5000 звезд', desc: 'Потратить 5000 звезд', detailDesc: 'Серьёзный вклад от серьёзного человека', image: '/images/achievements/stars-5000.png' },
  { key: 'stars_10000', title: 'Инвестор', subtitle: 'Потратить 10 000 звезд', desc: 'Потратить 10 000 звезд', detailDesc: 'Что-то на богатом', image: '/images/achievements/stars-10000.png' },
]

export const ACHIEVEMENT_BY_KEY = new Map(ACHIEVEMENT_CATALOG.map(item => [item.key, item]))

export function getAchievementMeta(key) {
  return ACHIEVEMENT_BY_KEY.get(key) || null
}

export function readVisibleAchievementKeys(defaultKeys = []) {
  const fallback = new Set(defaultKeys)
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(ACHIEVEMENT_VISIBILITY_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return fallback
    return new Set(parsed.filter(Boolean))
  } catch {
    return fallback
  }
}

export function writeVisibleAchievementKeys(keys) {
  const nextKeys = Array.from(keys)
  if (typeof window === 'undefined') return nextKeys

  window.localStorage.setItem(ACHIEVEMENT_VISIBILITY_STORAGE_KEY, JSON.stringify(nextKeys))
  window.dispatchEvent(new CustomEvent('swipik:achievement-visibility-changed', {
    detail: { keys: nextKeys },
  }))
  return nextKeys
}
