import { useState, useEffect } from 'react'
import api from '../api.js'
import { Screen, ScreenHeader, LoadingState } from '../components/ui'

export default function AchievementsScreen() {
  const [tab, setTab] = useState('achievements')
  const [achievements, setAchievements] = useState([])
  const [tasks, setTasks] = useState([])
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claimingTask, setClaimingTask] = useState(null)

  useEffect(() => {
    Promise.all([
      api.getAchievements(),
      api.getTasks(),
      api.getReferral().catch(() => null),
    ]).then(([achData, taskData, refData]) => {
      setAchievements(achData.achievements)
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

  if (loading) {
    return (
      <Screen variant="black">
        <LoadingState />
      </Screen>
    )
  }

  return (
    <Screen variant="black" withNav>
      <ScreenHeader title="АЧИВКИ И ЗАДАНИЯ" />

      {/* Promo banner — unique Figma layout, kept inline */}
      <div className="overflow-hidden relative" style={{
        margin: '16px var(--gutter) 0',
        borderRadius: 30,
        backgroundImage: 'linear-gradient(172.52813766999773deg, rgb(249, 26, 134) 178.28%, rgb(0, 0, 0) 163.52%)',
        backgroundColor: 'var(--surface-base)',
        height: 157,
      }}>
        <div className="row" style={{
          position: 'absolute', left: '50%', top: 'calc(50% + 0.5px)',
          transform: 'translate(-50%, -50%)', gap: 26, width: 309,
        }}>
          <img src="/icons/legend-badge.png" alt=""
            style={{ width: 92, height: 102, objectFit: 'contain', flexShrink: 0 }} />
          <div className="stack-md" style={{ width: 189, gap: 16 }}>
            <p className="text-body">Выполняй задания</p>
            <p className="text-body">Открывай достижения</p>
            <p className="text-body">Зарабатывай свайп-очки</p>
          </div>
        </div>
        <p className="text-caption text-ink" style={{
          position: 'absolute', top: 139, left: 'calc(50% - 122.5px)',
          width: 246,
        }}>
          И меняй их на улучшения и Premium-подписку!
        </p>
      </div>

      {/* Segmented control — unique mix-blend-mode glass, kept inline */}
      <div className="px-gutter" style={{
        padding: '16px var(--gutter) 12px',
        position: 'sticky', top: 0,
        background: 'var(--surface-base)', zIndex: 'var(--z-sticky)',
      }}>
        <div className="row overflow-hidden relative" style={{
          gap: 5, height: 54, borderRadius: 123, padding: 5,
        }}>
          <div className="absolute-fill no-pointer" style={{ background: 'rgba(0,0,0,0.1)', mixBlendMode: 'luminosity', borderRadius: 'inherit' }} />
          <div className="absolute-fill no-pointer" style={{ background: 'rgba(208,208,208,0.5)', mixBlendMode: 'color-burn', borderRadius: 'inherit' }} />

          {[
            { key: 'achievements', label: 'Ачивки' },
            { key: 'tasks', label: 'Задания' },
            { key: 'invites', label: 'Инвайты' },
          ].map(t =>
            tab === t.key ? (
              <div
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 relative overflow-hidden center pointer"
                style={{
                  borderRadius: 30,
                  border: '0.759px solid rgba(255,255,255,0.4)',
                  boxShadow: '0px 3.035px 6.07px rgba(0,0,0,0.1)',
                }}
              >
                <div className="absolute-fill no-pointer" style={{ background: 'rgba(255,255,255,0.06)', mixBlendMode: 'lighten' }} />
                <div className="absolute-fill no-pointer" style={{ background: '#5e5e5e', mixBlendMode: 'color-dodge' }} />
                <span className="text-h3 font-regular" style={{ position: 'relative', zIndex: 1 }}>
                  {t.label}
                </span>
              </div>
            ) : (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 relative pointer text-h3 font-regular text-ink"
                style={{
                  height: '100%', background: 'transparent', border: 'none',
                  fontFamily: 'inherit', borderRadius: 100, zIndex: 1,
                }}
              >
                {t.label}
              </button>
            )
          )}

          <div className="absolute-fill no-pointer" style={{
            borderRadius: 'inherit',
            boxShadow: 'inset 0px -0.616px 1.232px rgba(255,255,255,0.3), inset 0px -0.616px 1.232px rgba(255,255,255,0.25), inset 1.232px 1.848px 4.928px rgba(0,0,0,0.08), inset 1.232px 1.848px 4.928px rgba(0,0,0,0.1)',
          }} />
        </div>
      </div>

      <div style={{ padding: '8px var(--gutter) 24px' }}>
        {tab === 'achievements' && (
          <>
            {achievements.filter(a => a.earned).length > 0 && (
              <>
                <p className="mb-sm text-body text-muted">Полученные</p>
                <div className="stack-xs mb-lg">
                  {achievements.filter(a => a.earned).map(a => <AchievementCard key={a.key} achievement={a} />)}
                </div>
              </>
            )}
            <p className="mb-sm text-body text-muted">Не полученные</p>
            <div className="stack-xs">
              {achievements.filter(a => !a.earned).map(a => <AchievementCard key={a.key} achievement={a} locked />)}
            </div>
          </>
        )}

        {tab === 'tasks' && (
          <div className="stack-xs">
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

            <div className="stack-md mx-auto" style={{ maxWidth: 315, gap: 21, width: '100%' }}>
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
    </Screen>
  )
}

function AchievementCard({ achievement, locked }) {
  return (
    <div className="row overflow-hidden" style={{
      alignItems: 'stretch',
      background: 'var(--surface-elev-1)',
      backdropFilter: 'blur(11px)', WebkitBackdropFilter: 'blur(11px)',
      borderRadius: 'clamp(12px, 4vw, 16px)',
      minHeight: 'clamp(110px, 29vw, 160px)',
    }}>
      {/* Badge box */}
      <div className="center relative overflow-hidden shrink-0 emoji-lg" style={{
        width: 'clamp(100px, 26vw, 136px)',
        margin: '11px 0 11px 11px',
        borderRadius: 'clamp(12px, 3.5vw, 16px)',
        background: locked
          ? 'linear-gradient(154deg, #e2e2e2 19%, #4d4d4d 111%)'
          : `linear-gradient(154deg, ${achievement.color}cc 19%, ${achievement.color} 111%)`,
        opacity: locked ? 0.55 : 1,
      }}>
        {locked ? '🔒' : achievement.icon}
        {!locked && (
          <div className="absolute-fill no-pointer" style={{
            borderRadius: 'inherit',
            background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25) 0%, transparent 60%)',
          }} />
        )}
      </div>

      {/* Right side */}
      <div className="flex-1" style={{
        padding: '12px 14px 10px 12px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <p className="text-tight text-h3 font-extra leading-snug" style={{
            marginBottom: 'clamp(3px, 1vw, 6px)',
          }}>
            {achievement.title}
          </p>
          <p className="text-small text-muted">
            {achievement.desc}
          </p>
        </div>
        <p className="text-caption text-dim text-right" style={{ marginTop: 4 }}>
          Имеется у {achievement.percent}
        </p>
      </div>
    </div>
  )
}

function InviteCodeRow({ invite, copied, disabled, onShare, onCopy }) {
  const used = invite.used
  const opacity = used ? 0.19 : disabled ? 0.4 : 1

  return (
    <div className="row-between" style={{ gap: 16, alignItems: 'center', width: '100%' }}>
      <button
        onClick={disabled ? undefined : onCopy}
        disabled={disabled}
        aria-label="Скопировать код"
        className="row pointer"
        style={{
          gap: 14, alignItems: 'center',
          background: 'transparent', border: 'none', padding: 0,
          fontFamily: 'inherit', cursor: disabled ? 'default' : 'pointer',
          opacity,
        }}
      >
        <span className="text-h2" style={{
          color: 'var(--text)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {invite.code}
        </span>
        <CopyIcon copied={copied} />
      </button>

      <button
        onClick={disabled ? undefined : onShare}
        disabled={disabled}
        className="row center pointer text-tight text-small font-medium"
        style={{
          gap: 8, height: 33,
          padding: '0 14px',
          background: 'var(--tg-blue)', border: 'none',
          borderRadius: 49,
          color: 'var(--text)', fontFamily: 'inherit',
          opacity,
          cursor: disabled ? 'default' : 'pointer',
          minWidth: 137,
        }}
      >
        <PaperPlaneIcon />
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

function PaperPlaneIcon() {
  return (
    <svg width="18" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text)' }}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

function TaskCard({ task, claiming, onSubscribe, onClaim }) {
  const isTgTask = task.key === 'subscribe_tg'

  return (
    <div className="row" style={{
      gap: 'clamp(10px, 3.5vw, 16px)',
      background: 'var(--surface-elev-1)',
      backdropFilter: 'blur(11px)', WebkitBackdropFilter: 'blur(11px)',
      borderRadius: 'clamp(12px, 4vw, 16px)',
      padding: 'clamp(12px, 4vw, 18px)',
    }}>
      <div className="center shrink-0 emoji-sm" style={{
        width: 'clamp(38px, 10vw, 48px)', height: 'clamp(38px, 10vw, 48px)',
        borderRadius: '50%',
        background: task.done ? 'rgba(76,175,80,0.25)' : 'var(--accent-soft)',
      }}>
        {task.done ? '✅' : isTgTask ? '✈️' : '👥'}
      </div>

      <div className="flex-1">
        <p className="text-small font-bold leading-snug" style={{
          textDecoration: task.done ? 'line-through' : 'none',
          opacity: task.done ? 0.5 : 1,
        }}>
          {task.title}
        </p>
        {task.progress !== null && (
          <p className="text-faint text-small" style={{ marginTop: 2 }}>
            {task.progress}/{task.total}
          </p>
        )}
        <p className="text-small font-semi" style={{
          color: task.reward_type === 'premium_3mo' ? 'var(--tg-blue)' : 'var(--gold)',
          marginTop: 3,
        }}>
          {task.reward_type === 'premium_3mo' ? '+Premium 3 мес' : `+${task.reward} 🪙`}
        </p>
      </div>

      {!task.done && (
        isTgTask && !task._opened ? (
          <button
            onClick={onSubscribe}
            className="btn-pink--ghost shrink-0"
            style={{
              padding: 'clamp(5px, 1.5vw, 8px) clamp(12px, 3.5vw, 16px)',
            }}
          >
            Старт
          </button>
        ) : (
          <button
            onClick={onClaim}
            disabled={claiming}
            className="btn-pink--sm shrink-0"
            style={{
              background: 'var(--accent-grad)', border: 'none',
              padding: 'clamp(5px, 1.5vw, 8px) clamp(12px, 3.5vw, 16px)',
              opacity: claiming ? 0.7 : 1,
            }}
          >
            {claiming ? '...' : 'Получить'}
          </button>
        )
      )}
    </div>
  )
}
