export const mockUsers = [
  {
    id: 1,
    name: 'Кристина',
    age: 24,
    distance: '1 км',
    verified: true,
    bio: 'Люблю путешествия и хорошее кино ✈️',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    ],
  },
  {
    id: 2,
    name: 'Алина',
    age: 20,
    distance: '3 км',
    verified: true,
    premium: true,
    bio: 'Кофе, книги и хорошая музыка ☕',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    ],
  },
  {
    id: 3,
    name: 'Валерия',
    age: 23,
    distance: '5 км',
    verified: false,
    bio: 'Фотограф и большой любитель природы 📸',
    photos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
    ],
  },
  {
    id: 4,
    name: 'Виктория',
    age: 26,
    distance: '2 км',
    verified: true,
    bio: 'Твои родители случайно не Запашные? Тогда откуда у них такой тигр?)',
    photos: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
    ],
  },
  {
    id: 5,
    name: 'Диана',
    age: 22,
    distance: '7 км',
    verified: false,
    bio: 'Танцую, пою, мечтаю 🌙',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    ],
  },
]

export const mockMatches = [
  {
    id: 1,
    name: 'Кристина',
    age: 24,
    verified: true,
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80',
    tgUsername: 'kristina_tg',
  },
  {
    id: 2,
    name: 'Лера',
    age: 19,
    verified: true,
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80',
    tgUsername: 'lera_tg',
    newMatch: true,
  },
  {
    id: 3,
    name: 'Оксана',
    age: 26,
    verified: false,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
    tgUsername: 'oksana_tg',
  },
]

export const mockLikes = [
  {
    id: 1,
    name: 'Виктория',
    age: 26,
    verified: true,
    bio: 'Твои родители случайно не Запашные?',
    emoji: '😍',
    photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
  },
  {
    id: 2,
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    blurred: true,
  },
  {
    id: 3,
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    blurred: true,
  },
  {
    id: 4,
    photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80',
    blurred: true,
  },
]

export const achievements = [
  {
    id: 1,
    title: 'Первопроходец',
    desc: 'Редкое достижение, доступное только первой тысяче юзеров',
    percent: '1%',
    earned: true,
    color: '#E91E8C',
    icon: '👟',
  },
  {
    id: 2,
    title: 'Ты у меня первый',
    desc: 'Сделать свой первый свайп',
    percent: '100%',
    earned: true,
    color: '#C4A060',
    icon: '☝️',
  },
  {
    id: 3,
    title: 'Король дизлайков',
    desc: 'Получить 10 000 дизлайков',
    percent: '3%',
    earned: false,
    color: '#666',
    icon: '👎',
  },
]

export const tasks = [
  { id: 1, title: 'Сделай 10 свайпов', reward: 50, done: true },
  { id: 2, title: 'Заполни описание профиля', reward: 100, done: false },
  { id: 3, title: 'Пригласи друга', reward: 200, done: false },
]
