// ============================================================================
//  SWAYPIK — МОК API ДЛЯ ПЕСОЧНИЦЫ (дизайн без бэкенда)
// ----------------------------------------------------------------------------
//  Бэкенда и сервера тут НЕТ. Каждый метод возвращает фейковые данные, чтобы
//  экраны рендерились и их можно было перерисовывать. Сигнатуры методов 1:1
//  совпадают с настоящим api.js — поэтому готовые экраны вставятся в проект
//  без переделки.
//
//  МЕНЯЙ ТОЛЬКО CONFIG НИЖЕ, чтобы посмотреть разные состояния экранов.
//  Сам файл при сдаче работы трогать не нужно — в проекте он останется боевым.
// ============================================================================

const CONFIG = {
  // С какого экрана стартует приложение:
  //   'app'        — основное приложение (поиск/лайки/мэтчи/ачивки/профиль)
  //   'onboarding' — регистрация (имя → пол → возраст → фото → гео → верификация)
  //   'invite'     — экран «вход только по инвайту»
  //   'banned'     — экран бана
  scenario: 'app',

  premium: true,        // true — все фичи открыты; false — пейволлы + блюр лайков
  dailyReward: false,   // true — при входе всплывёт модалка ежедневной награды
  emptyFeed: false,     // true — в поиске «люди закончились»
  emptyLikes: false,    // true — нет входящих лайков
  emptyMatches: false,  // true — нет мэтчей
}

// ─── вспомогательное ────────────────────────────────────────────────────────
const delay = (ms = 160) => new Promise(r => setTimeout(r, ms))
const ok = async (data = {}) => { await delay(); return data }
const future = (days) => new Date(Date.now() + days * 864e5).toISOString()

const PHOTO = (seed, w = 600) => `https://picsum.photos/seed/${seed}/${w}/${Math.round(w * 1.4)}`

// ─── изменяемое состояние сессии (живёт до перезагрузки страницы) ────────────
const DEFAULT_PROFILE = {
  id: 999,
  name: 'Алекс',
  age: 25,
  gender: 'male',
  city: 'Москва',
  bio: 'Тестовый профиль песочницы. Меняй дизайн смело 🎨',
  verified: true,
  is_premium: CONFIG.premium,
  premium_until: CONFIG.premium ? future(45) : null,
  is_hidden: false,
  photos: [
    { id: 1, url: PHOTO('me-1') },
    { id: 2, url: PHOTO('me-2') },
  ],
  superlike_daily: 3,
  swipe_coins: 1250,
  booster_active: false,
  booster_until: null,
  meme_stats: { rated: 7, total: 20 },
}

const state = {
  profile: CONFIG.scenario === 'onboarding' ? null : { ...DEFAULT_PROFILE },
}

function buildUser() {
  if (CONFIG.scenario === 'onboarding') return { id: 1, profile: state.profile }
  if (CONFIG.scenario === 'invite')     return { id: 1, invite_only_required: true }
  if (CONFIG.scenario === 'banned')     return { id: 1, profile: state.profile, is_banned: true }
  return { id: 1, profile: state.profile, is_premium: CONFIG.premium }
}

// ─── фейковые данные ────────────────────────────────────────────────────────
const FEED = [
  { id: 11, name: 'Кристина', age: 24, distance: '1 км', city: 'Москва',   verified: true,  compatibility: 92, bio: 'Люблю путешествия и хорошее кино ✈️', photos: [PHOTO('k1'), PHOTO('k2')] },
  { id: 12, name: 'Алина',    age: 20, distance: '3 км', city: 'Москва',   verified: true,  compatibility: 78, bio: 'Кофе, книги и хорошая музыка ☕',       photos: [PHOTO('a1')] },
  { id: 13, name: 'Валерия',  age: 23, distance: '5 км', city: 'Подольск', verified: false, compatibility: 64, bio: 'Фотограф и любитель природы 📸',         photos: [PHOTO('v1'), PHOTO('v2')] },
  { id: 14, name: 'Виктория', age: 26, distance: '2 км', city: 'Москва',   verified: true,  compatibility: 45, bio: 'Твои родители случайно не Запашные?)',    photos: [PHOTO('vi1')] },
  { id: 15, name: 'Диана',    age: 22, distance: '7 км', city: 'Химки',    verified: false, compatibility: 88, bio: 'Танцую, пою, мечтаю 🌙',                 photos: [PHOTO('d1')] },
]

const LIKES = [
  { id: 21, user_id: 21, name: 'Виктория', age: 26, verified: true,  type: 'super', bio: 'Твои родители случайно не Запашные?', photo: PHOTO('like1') },
  { id: 22, user_id: 22, name: 'Оксана',   age: 23, verified: true,  type: 'like',  bio: 'Сова, латте и долгие прогулки',       photo: PHOTO('like2') },
  { id: 23, user_id: 23, name: 'Полина',   age: 21, verified: false, type: 'like',  bio: '',                                    photo: PHOTO('like3') },
  { id: 24, user_id: 24, name: 'Марина',   age: 27, verified: true,  type: 'like',  bio: '',                                    photo: PHOTO('like4') },
  { id: 25, user_id: 25, name: 'Ника',     age: 24, verified: false, type: 'like',  bio: '',                                    photo: PHOTO('like5') },
]

const MATCHES = [
  { id: 31, name: 'Кристина', age: 24, verified: true,  username: 'kristina_tg', is_online: true,  photo: PHOTO('m1', 200) },
  { id: 32, name: 'Лера',     age: 19, verified: true,  username: 'lera_tg',     is_online: false, photo: PHOTO('m2', 200) },
  { id: 33, name: 'Оксана',   age: 26, verified: false, username: 'oksana_tg',   is_online: false, photo: PHOTO('m3', 200) },
]

const MEMES = Array.from({ length: 14 }, (_, i) => ({
  id: 100 + i,
  url: `https://picsum.photos/seed/meme${i}/500/500`,
}))

const ACHIEVEMENTS = [
  { key: 'pioneer',  title: 'Первопроходец',   desc: 'Доступно только первой тысяче юзеров', percent: '1%',   earned: true,  color: '#E91E8C', icon: '👟' },
  { key: 'first',    title: 'Ты у меня первый', desc: 'Сделать свой первый свайп',           percent: '100%', earned: true,  color: '#C4A060', icon: '☝️' },
  { key: 'dislikes', title: 'Король дизлайков', desc: 'Получить 10 000 дизлайков',           percent: '3%',   earned: false, color: '#7A5CFF', icon: '👎' },
  { key: 'popular',  title: 'Сердцеед',         desc: 'Получить 100 лайков',                 percent: '12%',  earned: false, color: '#FF6B6B', icon: '💘' },
]

const TASKS = [
  { key: 'swipe_10',     title: 'Сделай 10 свайпов',       reward: 50,  reward_type: 'coins',       done: true,  progress: 10,   total: 10 },
  { key: 'fill_bio',     title: 'Заполни описание профиля', reward: 100, reward_type: 'coins',       done: false, progress: null, total: null },
  { key: 'subscribe_tg', title: 'Подпишись на наш канал',   reward: 75,  reward_type: 'coins',       done: false, progress: null, total: null },
  { key: 'invite_5',     title: 'Пригласи 5 друзей',       reward: 0,   reward_type: 'premium_3mo', done: false, progress: 2,    total: 5 },
]

const REFERRAL = {
  share_freeze_seconds: 3600,
  codes: [
    { id: 1, code: 'SWPK-1A2B', link: 'https://t.me/swaypik_bot?startapp=SWPK-1A2B', used: false, shared_at: null },
    { id: 2, code: 'SWPK-3C4D', link: 'https://t.me/swaypik_bot?startapp=SWPK-3C4D', used: false, shared_at: null },
    { id: 3, code: 'SWPK-5E6F', link: 'https://t.me/swaypik_bot?startapp=SWPK-5E6F', used: true,  shared_at: null },
    { id: 4, code: 'SWPK-7G8H', link: 'https://t.me/swaypik_bot?startapp=SWPK-7G8H', used: false, shared_at: null },
    { id: 5, code: 'SWPK-9I0J', link: 'https://t.me/swaypik_bot?startapp=SWPK-9I0J', used: false, shared_at: null },
  ],
}

const EXCHANGE_PLANS = [
  { key: 'sl_1',    coins: 300,  reward: '1 суперлайк',   type: 'superlike' },
  { key: 'sl_5',    coins: 1200, reward: '5 суперлайков', type: 'superlike' },
  { key: 'boost_1', coins: 800,  reward: '1 бустер',      type: 'booster' },
]

function fullUserProfile(userId) {
  const base = FEED.find(u => u.id === userId) || LIKES.find(u => u.id === userId) || FEED[0]
  return {
    id: userId,
    name: base.name,
    age: base.age,
    verified: base.verified,
    city: base.city || 'Москва',
    bio: base.bio || 'Привет! Это тестовая анкета песочницы.',
    photos: base.photos || [PHOTO(`u${userId}-1`), PHOTO(`u${userId}-2`)],
    compatibility: base.compatibility ?? 73,
    username: 'mock_user',
    interests: ['Путешествия', 'Кино', 'Кофе', 'Музыка', 'Спорт'],
    zodiac: 'Весы',
    height: 170,
    kids: 'Без детей',
    alcohol: 'Иногда',
    smoke: 'Не курю',
    achievements: [
      { key: 'pioneer', title: 'Первопроходец', color: '#E91E8C', icon: '👟' },
      { key: 'first',   title: 'Ты у меня первый', color: '#C4A060', icon: '☝️' },
    ],
  }
}

// ─── токен (как в боевом, чтобы useAuth работал штатно) ──────────────────────
function getToken() { return localStorage.getItem('token') }
function setToken(token) { localStorage.setItem('token', token) }
function removeToken() { localStorage.removeItem('token') }

// ─── собственно мок-API (сигнатуры 1:1 с боевым api.js) ──────────────────────
const api = {
  // ── Auth ──
  authTelegram() { return ok({ token: 'mock-token', user: buildUser() }) },
  devLogin()     { return ok({ token: 'mock-token', user: buildUser() }) },
  me()           { return ok({ user: buildUser() }) },
  logout()       { return ok() },

  // ── Profile ──
  getProfile()   { return ok({ profile: state.profile }) },
  createProfile(data) {
    state.profile = { ...DEFAULT_PROFILE, ...data, photos: state.profile?.photos || DEFAULT_PROFILE.photos }
    return ok({ profile: state.profile })
  },
  updateProfile(data) {
    state.profile = { ...state.profile, ...data }
    return ok({ profile: state.profile })
  },
  uploadPhoto(file) {
    const url = (typeof URL !== 'undefined' && URL.createObjectURL) ? URL.createObjectURL(file) : PHOTO('upload' + Date.now())
    const photo = { id: Date.now(), url }
    state.profile = { ...state.profile, photos: [...(state.profile?.photos || []), photo] }
    return ok({ photo })
  },
  deletePhoto() { return ok() },

  // ── Feed ──
  getFeed() { return ok({ users: CONFIG.emptyFeed ? [] : [...FEED] }) },

  // ── Swipes ──
  swipe(targetUserId, type) {
    const u = FEED.find(x => x.id === targetUserId)
    const isMatch = type === 'super' && !!u
    return ok({
      superlike_left: 5,
      is_match: isMatch,
      match_user: isMatch ? { id: u.id, name: u.name, photo: u.photos?.[0], username: 'mock_user' } : null,
    })
  },
  undoSwipe() { return ok({ return_user: FEED[0] }) },

  // ── Memes ──
  getMemes()  { return ok({ memes: [...MEMES], rated_count: 7, total: 20 }) },
  reactMeme() { return ok() },

  // ── Matches ──
  getMatches() { return ok({ matches: CONFIG.emptyMatches ? [] : [...MATCHES], lost_count: 0 }) },

  // ── Likes ──
  getLikes() { return ok({ likes: CONFIG.emptyLikes ? [] : [...LIKES], is_premium: CONFIG.premium }) },

  // ── Report ──
  report() { return ok() },

  // ── Daily Login ──
  getDailyLogin()   { return ok({ has_reward: CONFIG.dailyReward, streak: 4, coins_reward: 50 }) },
  claimDailyLogin() { return ok({ has_reward: false, streak: 5, coins_reward: 50 }) },

  // ── Achievements / Tasks ──
  getAchievements() { return ok({ achievements: [...ACHIEVEMENTS] }) },
  getTasks()        { return ok({ tasks: [...TASKS] }) },
  claimTask()       { return ok({ message: 'Награда получена! +монеты' }) },

  // ── Booster ──
  activateBooster() {
    state.profile = { ...state.profile, booster_active: true, booster_until: new Date(Date.now() + 30 * 6e4).toISOString() }
    return ok({ message: 'Бустер активирован на 30 минут!' })
  },

  // ── Referral ──
  getReferral()      { return ok({ ...REFERRAL, codes: REFERRAL.codes.map(c => ({ ...c })) }) },
  markInviteShared() { return ok({ shared_at: new Date().toISOString() }) },

  // ── Exchange ──
  getExchangePlans() { return ok({ plans: [...EXCHANGE_PLANS] }) },
  exchange(planKey) {
    const plan = EXCHANGE_PLANS.find(p => p.key === planKey)
    if (plan) state.profile = { ...state.profile, swipe_coins: Math.max(0, (state.profile?.swipe_coins || 0) - plan.coins) }
    return ok({ message: 'Обмен выполнен!' })
  },

  // ── Premium / Payment ── (в браузере openInvoice недоступен → код покажет alert-успех)
  createInvoice()      { return ok({ invoice_link: null }) },
  activatePremiumDev() { return ok({ ok: true }) },
  purchaseSuperlikes() { return ok({ invoice_url: null }) },
  purchaseUndos()      { return ok({ invoice_url: null }) },

  // ── Invite ──
  checkInviteCode(code) { return code ? ok({ ok: true }) : Promise.reject(new Error('Неверный инвайт-код')) },

  // ── User Profile (просмотр чужой анкеты) ──
  getUserProfile(userId) { return ok({ user: fullUserProfile(userId) }) },
  revealContact()        { return ok({ username: 'mock_user' }) },
  getRevealPrice()       { return ok({ price: 5 }) },

  getToken,
  setToken,
  removeToken,
}

export default api
