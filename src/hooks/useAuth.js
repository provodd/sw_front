import { useState, useEffect } from 'react'
import api from '../api.js'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    // Если токен уже есть — пробуем загрузить профиль
    if (api.getToken()) {
      try {
        const data = await api.me()
        setUser(data.user)
        setLoading(false)
        return
      } catch {
        // Токен невалидный (пользователь удалён / сессия истекла)
        // Удаляем и переходим к Telegram-авторизации ниже
        api.removeToken()
      }
    }

    // Авторизуемся через Telegram (или dev-login в браузере)
    try {
      const tg = window.Telegram?.WebApp
      const devSecret = import.meta.env.VITE_DEV_SECRET
      let data
      if (!tg?.initData && devSecret) {
        data = await api.devLogin(devSecret)
      } else {
        // Получаем initData, с fallback на URL параметры если initData недоступна
        let initData = tg?.initData || makeMockInitData()

        // Если initData не содержит start_param, добавляем из URL
        const urlStartParam = new URLSearchParams(window.location.search).get('startapp')
        if (urlStartParam && !initData.includes('start_param=')) {
          initData += (initData.includes('?') ? '&' : '?') + `start_param=${encodeURIComponent(urlStartParam)}`
        }

        data = await api.authTelegram(initData)
      }
      api.setToken(data.token)
      setUser(data.user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { user, setUser, loading, error }
}

// В браузере (не в Telegram) используем тестовые данные
function makeMockInitData() {
  const user = {
    id: 100000 + Math.floor(Math.random() * 900000),
    first_name: 'Тест',
    username: 'testuser',
  }
  return `user=${encodeURIComponent(JSON.stringify(user))}`
}
