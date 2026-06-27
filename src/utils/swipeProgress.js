const KEY = 'swaypik_swipe_progress'
export const SWIPES_TO_UNLOCK_LIKES = 30

export function getSwipeProgress() {
  const value = Number.parseInt(localStorage.getItem(KEY) || '0', 10)
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

export function registerSwipe() {
  const next = getSwipeProgress() + 1
  localStorage.setItem(KEY, String(next))
  window.dispatchEvent(new CustomEvent('swaypik:swipe-progress', { detail: next }))
  return next
}
