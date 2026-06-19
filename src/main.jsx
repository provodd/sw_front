import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Init Telegram WebApp
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp
  tg.ready()

  // Debug: log start_param for troubleshooting invite links
  const startParam = tg.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('startapp')
  if (startParam) {
    console.log('🔗 Invite code from startapp:', startParam)
  }
  console.log('📱 Telegram initDataUnsafe:', tg.initDataUnsafe)
  console.log('🔗 URL params:', Object.fromEntries(new URLSearchParams(window.location.search)))

  const isMobile = tg.platform === 'android' || tg.platform === 'ios'
  if (isMobile) {
    tg.expand()
    if (tg.requestFullscreen) tg.requestFullscreen()
    if (tg.disableVerticalSwipes) tg.disableVerticalSwipes()
  }
  tg.enableClosingConfirmation()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
