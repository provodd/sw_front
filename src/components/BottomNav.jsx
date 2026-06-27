import TelegramIcon from './icons/TelegramIcon.jsx'

export default function BottomNav({ tab, setTab }) {
  const items = [
    { key: 'matches', label: 'Мэтчи', icon: <MatchesIcon /> },
    { key: 'likes', label: 'Лайки', icon: <LikesIcon /> },
    { key: 'search', label: 'Поиск', icon: <SearchIcon /> },
    { key: 'achievements', label: 'Достижения', icon: <TrophyIcon /> },
    { key: 'profile', label: 'Профиль', icon: <ProfileIcon /> },
  ]
  const activeIndex = Math.max(0, items.findIndex(item => item.key === tab))

  return (
    <nav
      className="bottom-nav glass-light"
      aria-label="Основная навигация"
      style={{ '--nav-active-index': activeIndex }}
    >
      <span className="nav-active-indicator" aria-hidden="true" />
      {items.map(item => (
        <button
          key={item.key}
          type="button"
          aria-label={item.label}
          aria-current={tab === item.key ? 'page' : undefined}
          className={`nav-btn ${tab === item.key ? 'active' : ''}`}
          onClick={() => setTab(item.key)}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  )
}

function MatchesIcon() {
  return <TelegramIcon className="nav-icon-send" />
}

const NAV_OUTLINE_ICON_PROPS = {
  viewBox: '0 0 32 27',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': 'true',
}

function LikesIcon() {
  return (
    <svg {...NAV_OUTLINE_ICON_PROPS}>
      <path d="M16 26 5.5 16C.8 11.5 3.3 1.9 10.8 1.9c2.5 0 4.2 1.4 5.2 3.1 1-1.7 2.7-3.1 5.2-3.1 7.5 0 10 9.6 5.3 14.1L16 26Z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg {...NAV_OUTLINE_ICON_PROPS}>
      <circle cx="13.4" cy="10.9" r="10" />
      <path d="m20.8 18.3 6.7 6.7" />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg
      viewBox="0 0 31 43"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="nav-icon-award"
    >
      <path
        strokeLinecap="butt"
        d="M10.3523 3.62537C12.8673 2.20846 14.1248 1.5 15.5 1.5C16.8752 1.5 18.1327 2.20846 20.6477 3.62537L24.1477 5.59722C26.7584 7.06801 28.0637 7.80341 28.7819 9.03327C29.5 10.2631 29.5 11.7631 29.5 14.7632V18.2368C29.5 21.2369 29.5 22.7369 28.7819 23.9667C28.0637 25.1966 26.7584 25.932 24.1477 27.4028L20.6477 29.3746C18.1327 30.7915 16.8752 31.5 15.5 31.5C14.1248 31.5 12.8673 30.7915 10.3523 29.3746L6.85226 27.4028C4.24162 25.932 2.9363 25.1966 2.21815 23.9667C1.5 22.7369 1.5 21.2369 1.5 18.2368V14.7632C1.5 11.7631 1.5 10.2631 2.21815 9.03327C2.9363 7.80341 4.24162 7.06802 6.85226 5.59722L10.3523 3.62537Z"
      />
      <path d="M9.5 17.8333C9.5 17.8333 11 17.8333 12.5 20.5C12.5 20.5 17.2647 13.8333 21.5 12.5" />
      <path d="M25.265 27.5L26.6054 33.9199C27.4666 38.0447 27.8972 40.1071 27.0127 41.0845C26.1282 42.062 24.592 41.2211 21.5198 39.5395L16.9728 37.0507C16.2468 36.6532 15.8837 36.4545 15.5 36.4545C15.1163 36.4545 14.7532 36.6532 14.0272 37.0507L9.48016 39.5395C6.40795 41.2211 4.87184 42.062 3.98731 41.0845C3.10277 40.1071 3.53339 38.0447 4.39462 33.9199L5.73504 27.5" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg {...NAV_OUTLINE_ICON_PROPS}>
      <circle cx="16" cy="6.6" r="5.3" />
      <path d="M3 25.4c1.4-5.2 5.8-8 13-8s11.6 2.8 13 8" />
    </svg>
  )
}
