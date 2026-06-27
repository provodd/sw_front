import { useState, useEffect } from 'react'
import api from '../api.js'
import BottomSheet from '../components/BottomSheet.jsx'
import TelegramIcon from '../components/icons/TelegramIcon.jsx'
import { Screen, ScreenHeader, LoadingState } from '../components/ui'
import {
  ACHIEVEMENT_CATALOG,
  readVisibleAchievementKeys,
  writeVisibleAchievementKeys,
} from '../data/achievements.js'

export default function AchievementsScreen() {
  const [tab, setTab] = useState('achievements')
  const [achievements, setAchievements] = useState([])
  const [tasks, setTasks] = useState([])
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claimingTask, setClaimingTask] = useState(null)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [visibleAchievementKeys, setVisibleAchievementKeys] = useState(() => readVisibleAchievementKeys())

  useEffect(() => {
    Promise.all([
      api.getAchievements(),
      api.getTasks(),
      api.getReferral().catch(() => null),
    ]).then(([achData, taskData, refData]) => {
      setAchievements(achData.achievements)
      setVisibleAchievementKeys(readVisibleAchievementKeys(achData.achievements.filter(item => item.earned).map(item => item.key)))
      setTasks(taskData.tasks)
      setReferral(refData)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleClaimTask = async (taskKey) => {
    setClaimingTask(taskKey)
    try {
      const result = await api.claimTask(taskKey)
      alert(result.message)
      setTasks(prev => prev.map(t => t.key === taskKey ? { ...t, done: true } : t))
    } catch (e) {
      alert(e.message)
    } finally {
      setClaimingTask(null)
    }
  }

  const [copiedId, setCopiedId] = useState(null)
  const [now, setNow] = useState(Date.now())

  // Тикаем раз в 30с пока в табе invites — чтобы код вышел из заморозки автоматически
  useEffect(() => {
    if (tab !== 'invites') return
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [tab])

  const handleShareInvite = async (id, link) => {
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')
      window.Telegram?.WebApp?.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Заходи в Свайпик — лучшее приложение для знакомств!')}`
      )
    } catch {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}`, '_blank')
    }
    // Помечаем код как пошаренный — оптимистично + подтверждение бэка
    const sharedAt = new Date().toISOString()
    setReferral(prev => prev && {
      ...prev,
      codes: prev.codes.map(c => c.id === id ? { ...c, shared_at: sharedAt } : c),
    })
    try {
      const res = await api.markInviteShared(id)
      setReferral(prev => prev && {
        ...prev,
        codes: prev.codes.map(c => c.id === id ? { ...c, shared_at: res.shared_at } : c),
      })
    } catch (e) {
      console.error('mark shared failed', e)
    }
  }

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success')
      setTimeout(() => setCopiedId(null), 1500)
    }).catch(() => alert(code))
  }

  const handleSubscribeTg = (taskKey) => {
    try {
      window.Telegram?.WebApp?.openTelegramLink('https://t.me/swaypik')
    } catch {
      window.open('https://t.me/swaypik', '_blank')
    }
    setTasks(prev => prev.map(t => t.key === taskKey ? { ...t, _opened: true } : t))
  }

  const handleAchievementVisibilityChange = (key, visible) => {
    setVisibleAchievementKeys(prev => {
      const next = new Set(prev)
      if (visible) {
        next.add(key)
      } else {
        next.delete(key)
      }
      writeVisibleAchievementKeys(next)
      return next
    })
  }

  if (loading) {
    return (
      <Screen variant="black">
        <LoadingState />
      </Screen>
    )
  }

  const achievementByKey = new Map(achievements.map(item => [item.key, item]))
  const achievementCards = ACHIEVEMENT_CATALOG.map(item => ({
    ...item,
    ...achievementByKey.get(item.key),
    title: item.title,
    desc: item.desc,
    image: item.image,
    tone: item.tone,
    percent: achievementByKey.get(item.key)?.percent ?? '100%',
    earned: achievementByKey.get(item.key)?.earned ?? false,
  }))
  const earnedAchievements = achievementCards.filter(item => item.earned)
  const lockedAchievements = achievementCards.filter(item => !item.earned)

  return (
    <Screen variant="black" withNav className="achievements-screen">
      <ScreenHeader title="АЧИВКИ И ЗАДАНИЯ" />

      <div className="achievements-promo overflow-hidden relative">
        <div className="achievements-promo__content row">
          <img className="achievements-promo__image" src="/images/achievements/legend.png" alt="" />
          <div className="achievements-promo__copy stack-md">
            <p className="text-body">Выполняй задания</p>
            <p className="text-body">Открывай достижения</p>
            <p className="text-body">Зарабатывай свайп-очки</p>
          </div>
        </div>
        <p className="achievements-promo__caption text-caption text-ink">
          И меняй их на улучшения и Premium-подписку!
        </p>
      </div>

      {/* Segmented control */}
      <div className="achievements-tabs px-gutter">
        <div className="segmented-control" style={{
          '--segment-index': ['achievements', 'tasks', 'invites'].indexOf(tab),
          '--segment-count': 3,
        }}>
          <span className="segmented-control__indicator" aria-hidden="true" />
          {[
            { key: 'achievements', label: 'Ачивки' },
            { key: 'tasks', label: 'Задания' },
            { key: 'invites', label: 'Инвайты' },
          ].map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`segmented-control__item text-body ${tab === t.key ? 'is-active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="achievements-content">
        {tab === 'achievements' && (
          <>
            {earnedAchievements.length > 0 && (
              <>
                <p className="achievements-section-title text-body text-muted">Полученные</p>
                <div className="achievements-list achievements-list--earned">
                  {earnedAchievements.map(item => (
                    <AchievementCard
                      key={item.key}
                      achievement={item}
                      onOpen={() => setSelectedAchievement(item)}
                    />
                  ))}
                </div>
              </>
            )}
            <p className="achievements-section-title text-body text-muted">Не полученные</p>
            <div className="achievements-list">
              {lockedAchievements.map(item => (
                <AchievementCard
                  key={item.key}
                  achievement={item}
                  onOpen={() => setSelectedAchievement(item)}
                />
              ))}
            </div>
          </>
        )}

        {tab === 'tasks' && (
          <div className="tasks-list">
            {tasks.map(task => (
              <TaskCard
                key={task.key}
                task={task}
                claiming={claimingTask === task.key}
                onSubscribe={() => handleSubscribeTg(task.key)}
                onClaim={() => handleClaimTask(task.key)}
              />
            ))}
          </div>
        )}

        {tab === 'invites' && (
          <div className="stack-lg" style={{ padding: '12px 0 20px' }}>
            <div className="stack-sm text-center mx-auto" style={{ maxWidth: 295 }}>
              <p className="text-tight text-body font-bold leading-snug">
                Вход в приложение возможен только по инвайту
              </p>
              <p className="text-body text-ink">
                Пригласив 5 друзей в приложение, ты получишь{' '}
                <span style={{ color: 'var(--text)' }}>Premium аккаунт</span> на 3 месяца
              </p>
            </div>

            <div className="invite-codes">
              {referral?.codes && sortInvites(referral.codes, referral.share_freeze_seconds ?? 3600, now).map(c => (
                <InviteCodeRow
                  key={c.id}
                  invite={c}
                  copied={copiedId === c.id}
                  disabled={c._disabled}
                  onShare={() => handleShareInvite(c.id, c.link)}
                  onCopy={() => handleCopyCode(c.id, c.code)}
                />
              ))}
              {!referral && <p className="text-center text-faint">Загружаем коды…</p>}
            </div>
          </div>
        )}
      </div>

      {selectedAchievement && (
        <AchievementDetailSheet
          achievement={selectedAchievement}
          visibleInProfile={visibleAchievementKeys.has(selectedAchievement.key)}
          onVisibleChange={(visible) => handleAchievementVisibilityChange(selectedAchievement.key, visible)}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </Screen>
  )
}

function AchievementCard({ achievement, onOpen }) {
  return (
    <button type="button" className="achievement-card card-dark" onClick={onOpen}>
      <div className={`achievement-card__media ${achievement.tone === 'accent' ? 'achievement-card__media--accent' : ''}`}>
        <img className="achievement-card__image" src={achievement.image} alt="" loading="lazy" />
      </div>

      <div className="achievement-card__body">
        <div className="achievement-card__copy">
          <h3 className="achievement-card__title text-h3 font-extra">{achievement.title}</h3>
          <p className="achievement-card__description text-small text-muted">{achievement.desc}</p>
        </div>
        <p className="achievement-card__percent text-caption text-dim text-right">
          Имеется у {achievement.percent}
        </p>
      </div>
    </button>
  )
}

function AchievementDetailSheet({ achievement, visibleInProfile, onVisibleChange, onClose }) {
  return (
    <BottomSheet onClose={onClose} className="achievement-detail-sheet">
      {closeSheet => (
        <div className="achievement-detail-sheet__content center">
          <div className={`achievement-detail-sheet__media ${achievement.tone === 'accent' ? 'achievement-detail-sheet__media--accent' : ''}`}>
            <img className="achievement-detail-sheet__image" src={achievement.image} alt="" />
          </div>

          <div className="achievement-detail-sheet__headline text-center">
            <h2 className="achievement-detail-sheet__title">{achievement.title}</h2>
            <p className="achievement-detail-sheet__subtitle">{achievement.subtitle || achievement.desc}</p>
          </div>

          <p className="achievement-detail-sheet__description text-center">
            {achievement.detailDesc || achievement.desc}
          </p>

          {achievement.earned && (
            <div className="achievement-detail-sheet__visibility row-between">
              <span>Показывать в профиле</span>
              <button
                type="button"
                className={`edit-profile-toggle ${visibleInProfile ? 'is-on' : ''}`}
                onClick={() => onVisibleChange?.(!visibleInProfile)}
                aria-pressed={visibleInProfile}
                aria-label="Показывать ачивку в профиле"
              >
                <span />
              </button>
            </div>
          )}

          <button type="button" onClick={closeSheet} className="achievement-detail-sheet__close btn-ghost text-body">
            Закрыть
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

function InviteCodeRow({ invite, copied, disabled, onShare, onCopy }) {
  const used = invite.used
  const stateClass = used ? 'is-used' : disabled ? 'is-disabled' : ''

  return (
    <div className={`invite-code-row ${stateClass}`}>
      <button
        onClick={disabled ? undefined : onCopy}
        disabled={disabled}
        aria-label="Скопировать код"
        className="invite-code-row__code pointer"
      >
        <span className="invite-code-row__value">
          {invite.code}
        </span>
        <CopyIcon copied={copied} />
      </button>

      <button
        onClick={disabled ? undefined : onShare}
        disabled={disabled}
        className="invite-code-row__share pointer"
      >
        <TelegramIcon />
        Поделиться
      </button>
    </div>
  )
}

function sortInvites(codes, freezeSeconds, nowMs) {
  const freezeMs = freezeSeconds * 1000
  const groupOf = (c) => {
    if (c.used) return 2
    const sharedMs = c.shared_at ? new Date(c.shared_at).getTime() : 0
    if (sharedMs && nowMs - sharedMs < freezeMs) return 1
    return 0
  }
  return codes
    .map(c => {
      const g = groupOf(c)
      return { ...c, _disabled: g > 0 }
    })
    .sort((a, b) => groupOf(a) - groupOf(b) || a.id - b.id)
}

function CopyIcon({ copied }) {
  if (copied) {
    return (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function TaskCard({ task, claiming, onSubscribe, onClaim }) {
  const isTgTask = task.key === 'subscribe_tg'
  const hasProgress = task.progress !== null && task.total !== null
  const canClaim = !hasProgress || task.progress >= task.total
  const actionState = task.done
    ? 'done'
    : isTgTask && !task._opened
      ? 'start'
      : canClaim
        ? 'claim'
        : 'disabled'

  return (
    <div className={`task-row task-row--${actionState}`}>
      <div className="task-row__main">
        <TaskIcon taskKey={task.key} />

        <div className="task-row__copy">
          <p className="task-row__title">
          {task.title}
          </p>
          <div className="task-row__meta">
            {hasProgress && (
              <span className="task-row__progress">{task.progress}/{task.total}</span>
            )}
            <span className="task-row__reward">
              {task.reward_type === 'premium_3mo' ? (
                '+Premium (3мес)'
              ) : (
                <>
                  +{task.reward}
                  <img src="/icons/coin.png" alt="" />
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {actionState === 'done' && <TaskDoneIcon />}
      {actionState === 'start' && (
        <button onClick={onSubscribe} className="task-row__action task-row__action--start">
          Старт
        </button>
      )}
      {(actionState === 'claim' || actionState === 'disabled') && (
        <button
          onClick={onClaim}
          disabled={claiming || actionState === 'disabled'}
          className={`task-row__action task-row__action--${actionState}`}
        >
          {claiming ? '...' : 'Получить'}
        </button>
      )}
    </div>
  )
}

function TaskIcon({ taskKey }) {
  if (taskKey === 'swipe_10') {
    return (
      <svg className="task-row__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M5 11h19M19 6l5 5-5 5M27 21H8M13 16l-5 5 5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (taskKey === 'subscribe_tg') {
    return <TelegramIcon className="task-row__icon task-row__icon--telegram" />
  }

  if (taskKey === 'invite_5') {
    return (
      <svg className="task-row__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="11" cy="10" r="5" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="23.5" cy="11.5" r="4" stroke="currentColor" strokeWidth="2.2" />
        <path d="M2.5 27c.8-6 3.7-9 8.5-9s7.7 3 8.5 9M18.5 20c1.3-1.3 2.9-2 4.9-2 3.6 0 5.8 2.4 6.1 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg className="task-row__icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="20" height="24" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M11 11h10M11 16h10M11 21h7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function TaskDoneIcon() {
  return (
    <svg className="task-row__done" viewBox="0 0 13 9" fill="none" aria-label="Выполнено">
      <path d="m1 4.5 3.4 3.3L12 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
