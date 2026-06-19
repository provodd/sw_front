import { useState, useEffect, useCallback } from 'react'
import Sticker from '../components/Sticker.jsx'
import api from '../api.js'
import { Screen } from '../components/ui'

export default function InviteOnlyScreen({ startCode, onSuccess }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submitCode = useCallback(async (codeToSubmit) => {
    if (!codeToSubmit.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.checkInviteCode(codeToSubmit.trim())
      onSuccess()
    } catch (e) {
      setError('Неверный инвайт-код')
    } finally {
      setLoading(false)
    }
  }, [onSuccess])

  // Автоматически применяем код если он передан через startCode пропс
  useEffect(() => {
    if (startCode && startCode.trim()) {
      setCode(startCode.trim())
      submitCode(startCode.trim())
    }
  }, [startCode, submitCode])

  const handleSubmit = async () => {
    await submitCode(code)
  }

  return (
    <Screen variant="gradient" centered scroll={false}>
      <div style={{ marginBottom: 28 }}>
        <Sticker emoji="🍿" size={256} />
      </div>

      <p className="text-h3 font-semi text-tight text-center leading-relaxed" style={{
        width: 300, marginBottom: 24,
      }}>
        В данный момент вход в Свайпик доступен только по приглашениям
      </p>

      <div className="stack-sm" style={{ width: 244, gap: 11 }}>
        <div className="overflow-hidden" style={{
          height: 45, borderRadius: 100,
          background: 'rgba(208,208,208,0.5)',
          boxShadow: 'inset 0px -0.5px 1px rgba(255,255,255,0.3), inset 1px 1.5px 4px rgba(0,0,0,0.1)',
        }}>
          <input
            value={code}
            onChange={e => { setCode(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Ввести инвайт-код:"
            className="full text-tight text-h3 font-regular text-ink"
            style={{
              padding: '0 20px',
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <p className="text-small text-center" style={{ color: 'var(--error)' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !code.trim()}
          className="btn-dark"
        >
          {loading ? '...' : 'Далее'}
        </button>
      </div>
    </Screen>
  )
}
