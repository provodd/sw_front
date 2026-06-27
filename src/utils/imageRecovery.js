const MAX_RETRIES = 2
const LOAD_TIMEOUT = 5000
const FALLBACK_SRC = '/images/profile-placeholder.svg'

function withRetryToken(src, attempt) {
  try {
    const url = new URL(src, window.location.href)
    url.searchParams.set('image_retry', `${attempt}-${Date.now()}`)
    return url.href
  } catch {
    return src
  }
}

export function installImageRecovery() {
  const pendingImages = new WeakMap()

  const clearImageTimeout = image => {
    const timeout = pendingImages.get(image)
    if (timeout) window.clearTimeout(timeout)
    pendingImages.delete(image)
  }

  const watchImage = image => {
    if (!(image instanceof HTMLImageElement)) return
    if (!image.src || image.src.endsWith(FALLBACK_SRC)) return

    clearImageTimeout(image)

    if (image.complete && image.naturalWidth > 0) return

    pendingImages.set(image, window.setTimeout(() => {
      if (!image.isConnected || image.naturalWidth > 0) return
      image.src = FALLBACK_SRC
    }, LOAD_TIMEOUT))
  }

  const handleImageError = event => {
    const image = event.target
    if (!(image instanceof HTMLImageElement)) return
    if (image.src.endsWith(FALLBACK_SRC)) return

    const originalSrc = image.dataset.originalSrc || image.currentSrc || image.src
    const retryCount = Number(image.dataset.retryCount || 0)

    image.dataset.originalSrc = originalSrc

    if (retryCount < MAX_RETRIES) {
      const nextRetry = retryCount + 1
      image.dataset.retryCount = String(nextRetry)
      window.setTimeout(() => {
        image.src = withRetryToken(originalSrc, nextRetry)
        watchImage(image)
      }, nextRetry * 250)
      return
    }

    clearImageTimeout(image)
    image.src = FALLBACK_SRC
  }

  const handleImageLoad = event => {
    const image = event.target
    if (!(image instanceof HTMLImageElement)) return
    clearImageTimeout(image)
    delete image.dataset.retryCount
    delete image.dataset.originalSrc
  }

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes') {
        watchImage(mutation.target)
        return
      }

      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLImageElement) watchImage(node)
        if (node instanceof Element) node.querySelectorAll('img').forEach(watchImage)
      })
    })
  })

  document.addEventListener('error', handleImageError, true)
  document.addEventListener('load', handleImageLoad, true)
  document.querySelectorAll('img').forEach(watchImage)
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  })

  return () => {
    observer.disconnect()
    document.removeEventListener('error', handleImageError, true)
    document.removeEventListener('load', handleImageLoad, true)
  }
}
